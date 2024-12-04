/**
 * WordPress dependencies
 */
import {
	Button,
	Dropdown,
	__experimentalText as Text,
	__experimentalDropdownContentWrapper as DropdownContentWrapper,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import {
	store as coreStore,
	privateApis as coreDataPrivateApis,
} from '@wordpress/core-data';
import { useState, useMemo, useCallback, useEffect } from '@wordpress/element';
import { privateApis as routerPrivateApis } from '@wordpress/router';
import { useSelect, useDispatch } from '@wordpress/data';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { privateApis as editorPrivateApis } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { drawerRight } from '@wordpress/icons';
import { usePrevious } from '@wordpress/compose';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import Page from '../page';
import {
	useDefaultViews,
	defaultLayouts,
} from '../sidebar-dataviews/default-views';
import {
	OPERATOR_IS_ANY,
	OPERATOR_IS_NONE,
	LAYOUT_LIST,
} from '../../utils/constants';

import AddNewPostModal from '../add-new-post';
import { unlock } from '../../lock-unlock';
import { useEditPostAction } from '../dataviews-actions';

const { usePostActions, usePostFields } = unlock( editorPrivateApis );
const { useLocation, useHistory } = unlock( routerPrivateApis );
const { useEntityRecordsWithPermissions } = unlock( coreDataPrivateApis );
const EMPTY_ARRAY = [];

const getDefaultView = ( defaultViews, activeView ) => {
	return defaultViews.find( ( { slug } ) => slug === activeView )?.view;
};

const getCustomView = ( editedEntityRecord ) => {
	if ( ! editedEntityRecord?.content ) {
		return undefined;
	}

	const content = JSON.parse( editedEntityRecord.content );
	if ( ! content ) {
		return undefined;
	}

	return {
		...content,
		layout: defaultLayouts[ content.type ]?.layout,
	};
};

/**
 * This function abstracts working with default & custom views by
 * providing a [ state, setState ] tuple based on the URL parameters.
 *
 * Consumers use the provided tuple to work with state
 * and don't have to deal with the specifics of default & custom views.
 *
 * @param {string} postType Post type to retrieve default views for.
 * @return {Array} The [ state, setState ] tuple.
 */
function useView( postType ) {
	const {
		path,
		query: { activeView = 'all', isCustom = 'false', layout },
	} = useLocation();
	const history = useHistory();

	const defaultViews = useDefaultViews( { postType } );
	const { editEntityRecord } = useDispatch( coreStore );
	const editedEntityRecord = useSelect(
		( select ) => {
			if ( isCustom !== 'true' ) {
				return undefined;
			}

			const { getEditedEntityRecord } = select( coreStore );
			return getEditedEntityRecord(
				'postType',
				'wp_dataviews',
				Number( activeView )
			);
		},
		[ activeView, isCustom ]
	);
	const [ view, setView ] = useState( () => {
		let initialView;
		if ( isCustom === 'true' ) {
			initialView = getCustomView( editedEntityRecord ) ?? {
				type: layout ?? LAYOUT_LIST,
			};
		} else {
			initialView = getDefaultView( defaultViews, activeView ) ?? {
				type: layout ?? LAYOUT_LIST,
			};
		}

		const type = layout ?? initialView.type;
		return {
			...initialView,
			type,
		};
	} );

	const setViewWithUrlUpdate = useCallback(
		( newView ) => {
			if ( newView.type === LAYOUT_LIST && ! layout ) {
				// Skip updating the layout URL param if
				// it is not present and the newView.type is LAYOUT_LIST.
			} else if ( newView.type !== layout ) {
				history.navigate(
					addQueryArgs( path, {
						layout: newView.type,
					} )
				);
			}

			setView( newView );

			if ( isCustom === 'true' && editedEntityRecord?.id ) {
				editEntityRecord(
					'postType',
					'wp_dataviews',
					editedEntityRecord?.id,
					{
						content: JSON.stringify( newView ),
					}
				);
			}
		},
		[
			history,
			isCustom,
			editEntityRecord,
			editedEntityRecord?.id,
			layout,
			path,
		]
	);

	// When layout URL param changes, update the view type
	// without affecting any other config.
	useEffect( () => {
		setView( ( prevView ) => ( {
			...prevView,
			type: layout ?? LAYOUT_LIST,
		} ) );
	}, [ layout ] );

	// When activeView or isCustom URL parameters change, reset the view.
	useEffect( () => {
		let newView;
		if ( isCustom === 'true' ) {
			newView = getCustomView( editedEntityRecord );
		} else {
			newView = getDefaultView( defaultViews, activeView );
		}

		if ( newView ) {
			const type = layout ?? newView.type;
			setView( {
				...newView,
				type,
			} );
		}
	}, [ activeView, isCustom, layout, defaultViews, editedEntityRecord ] );

	return [ view, setViewWithUrlUpdate, setViewWithUrlUpdate ];
}

const DEFAULT_STATUSES = 'draft,future,pending,private,publish'; // All but 'trash'.

function getItemId( item ) {
	return item.id.toString();
}

export default function PostList( { postType } ) {
	const [ view, setView ] = useView( postType );
	const defaultViews = useDefaultViews( { postType } );
	const history = useHistory();
	const location = useLocation();
	const {
		postId,
		quickEdit = false,
		isCustom,
		activeView = 'all',
	} = location.query;
	const [ selection, setSelection ] = useState( postId?.split( ',' ) ?? [] );
	const onChangeSelection = useCallback(
		( items ) => {
			setSelection( items );
			if ( ( location.query.isCustom ?? 'false' ) === 'false' ) {
				history.navigate(
					addQueryArgs( location.path, {
						postId: items.join( ',' ),
					} )
				);
			}
		},
		[ location.path, location.query.isCustom, history ]
	);

	const getActiveViewFilters = ( views, match ) => {
		const found = views.find( ( { slug } ) => slug === match );
		return found?.filters ?? [];
	};

	const { isLoading: isLoadingFields, fields: _fields } = usePostFields( {
		postType,
	} );
	const fields = useMemo( () => {
		const activeViewFilters = getActiveViewFilters(
			defaultViews,
			activeView
		).map( ( { field } ) => field );
		return _fields.map( ( field ) => ( {
			...field,
			elements: activeViewFilters.includes( field.id )
				? []
				: field.elements,
		} ) );
	}, [ _fields, defaultViews, activeView ] );

	const queryArgs = useMemo( () => {
		const filters = {};
		view.filters?.forEach( ( filter ) => {
			if (
				filter.field === 'status' &&
				filter.operator === OPERATOR_IS_ANY
			) {
				filters.status = filter.value;
			}
			if (
				filter.field === 'author' &&
				filter.operator === OPERATOR_IS_ANY
			) {
				filters.author = filter.value;
			} else if (
				filter.field === 'author' &&
				filter.operator === OPERATOR_IS_NONE
			) {
				filters.author_exclude = filter.value;
			}
		} );

		// The bundled views want data filtered without displaying the filter.
		const activeViewFilters = getActiveViewFilters(
			defaultViews,
			activeView
		);
		activeViewFilters.forEach( ( filter ) => {
			if (
				filter.field === 'status' &&
				filter.operator === OPERATOR_IS_ANY
			) {
				filters.status = filter.value;
			}
			if (
				filter.field === 'author' &&
				filter.operator === OPERATOR_IS_ANY
			) {
				filters.author = filter.value;
			} else if (
				filter.field === 'author' &&
				filter.operator === OPERATOR_IS_NONE
			) {
				filters.author_exclude = filter.value;
			}
		} );

		// We want to provide a different default item for the status filter
		// than the REST API provides.
		if ( ! filters.status || filters.status === '' ) {
			filters.status = DEFAULT_STATUSES;
		}

		return {
			per_page: view.perPage,
			page: view.page,
			_embed: 'author',
			order: view.sort?.direction,
			orderby: view.sort?.field,
			search: view.search,
			...filters,
		};
	}, [ view, activeView, defaultViews ] );
	const {
		records,
		isResolving: isLoadingData,
		totalItems,
		totalPages,
	} = useEntityRecordsWithPermissions( 'postType', postType, queryArgs );

	// The REST API sort the authors by ID, but we want to sort them by name.
	const data = useMemo( () => {
		if ( ! isLoadingFields && view?.sort?.field === 'author' ) {
			return filterSortAndPaginate(
				records,
				{ sort: { ...view.sort } },
				fields
			).data;
		}

		return records;
	}, [ records, fields, isLoadingFields, view?.sort ] );

	const ids = data?.map( ( record ) => getItemId( record ) ) ?? [];
	const prevIds = usePrevious( ids ) ?? [];
	const deletedIds = prevIds.filter( ( id ) => ! ids.includes( id ) );
	const postIdWasDeleted = deletedIds.includes( postId );

	useEffect( () => {
		if ( postIdWasDeleted ) {
			history.navigate(
				addQueryArgs( location.path, {
					postId: undefined,
				} )
			);
		}
	}, [ history, postIdWasDeleted, location.path ] );

	const paginationInfo = useMemo(
		() => ( {
			totalItems,
			totalPages,
		} ),
		[ totalItems, totalPages ]
	);

	const { labels, canCreateRecord, showPageForPostsOption } = useSelect(
		( select ) => {
			const { getPostType, canUser, getEntityRecord } =
				select( coreStore );
			const siteSettings = getEntityRecord( 'root', 'site' );
			const isPagePostType = getPostType( postType )?.slug === 'page';
			const isStaticHomepage = siteSettings?.show_on_front === 'page';
			const isPageForPostsSet = getEntityRecord(
				'postType',
				'page',
				siteSettings?.page_for_posts
			);
			return {
				labels: getPostType( postType )?.labels,
				canCreateRecord: canUser( 'create', {
					kind: 'postType',
					name: postType,
				} ),
				showPageForPostsOption:
					isPagePostType && isStaticHomepage && ! isPageForPostsSet,
			};
		},
		[ postType ]
	);

	const postTypeActions = usePostActions( {
		postType,
		context: 'list',
	} );
	const editAction = useEditPostAction();
	const actions = useMemo(
		() => [ editAction, ...postTypeActions ],
		[ postTypeActions, editAction ]
	);

	const [ showAddPostModal, setShowAddPostModal ] = useState( false );
	const [ typeOfPageToCreate, setTypeOfPageToCreate ] = useState( '' );

	const openModal = ( typeOfPage ) => {
		setTypeOfPageToCreate( typeOfPage );
		setShowAddPostModal( true );
	};
	const closeModal = () => {
		setTypeOfPageToCreate( '' );
		setShowAddPostModal( false );
	};

	const NewPageDropdownButton = () => {
		return (
			<Dropdown
				popoverProps={ { placement: 'bottom-end' } }
				renderToggle={ ( { onToggle, isOpen } ) => {
					const toggleProps = {
						onClick: onToggle,
						'aria-expanded': isOpen,
						label: labels?.add_new_item,
					};

					return (
						<Button
							variant="primary"
							__next40pxDefaultSize
							{ ...toggleProps }
						>
							{ toggleProps.label }
						</Button>
					);
				} }
				renderContent={ () => (
					<DropdownContentWrapper paddingSize="medium">
						<VStack
							className="dataviews-new-page-options"
							spacing={ 1 }
							style={ { minWidth: '250px' } }
						>
							<Button
								__next40pxDefaultSize
								onClick={ () => openModal() }
							>
								{ __( 'Regular page' ) }
							</Button>
							<Button
								__next40pxDefaultSize
								onClick={ () => openModal( 'pageForPosts' ) }
								style={ {
									flexDirection: 'column',
									alignItems: 'flex-start',
								} }
							>
								{ __( 'Blog' ) }
								<Text variant="muted" align="left">
									{ __(
										'Create a page to display latest posts'
									) }
								</Text>
							</Button>
						</VStack>
					</DropdownContentWrapper>
				) }
			/>
		);
	};

	const handleNewPage = ( { type, id } ) => {
		history.navigate( `/${ type }/${ id }?canvas=edit` );
		closeModal();
	};

	const AddNewPageButton = () => {
		if ( showPageForPostsOption ) {
			return <NewPageDropdownButton />;
		}

		return (
			<Button
				variant="primary"
				onClick={ openModal }
				__next40pxDefaultSize
			>
				{ labels.add_new_item }
			</Button>
		);
	};

	return (
		<Page
			title={ labels?.name }
			actions={
				labels?.add_new_item &&
				canCreateRecord && (
					<>
						<AddNewPageButton />
						{ showAddPostModal && (
							<AddNewPostModal
								postType={ postType }
								typeOfPage={ typeOfPageToCreate }
								onSave={ handleNewPage }
								onClose={ closeModal }
							/>
						) }
					</>
				)
			}
		>
			<DataViews
				key={ activeView + isCustom }
				paginationInfo={ paginationInfo }
				fields={ fields }
				actions={ actions }
				data={ data || EMPTY_ARRAY }
				isLoading={ isLoadingData || isLoadingFields }
				view={ view }
				onChangeView={ setView }
				selection={ selection }
				onChangeSelection={ onChangeSelection }
				isItemClickable={ ( item ) => item.status !== 'trash' }
				onClickItem={ ( { id } ) => {
					history.navigate( `/${ postType }/${ id }?canvas=edit` );
				} }
				getItemId={ getItemId }
				defaultLayouts={ defaultLayouts }
				header={
					window.__experimentalQuickEditDataViews &&
					view.type !== LAYOUT_LIST &&
					postType === 'page' && (
						<Button
							size="compact"
							isPressed={ quickEdit }
							icon={ drawerRight }
							label={ __( 'Details' ) }
							onClick={ () => {
								history.navigate(
									addQueryArgs( location.path, {
										quickEdit: quickEdit ? undefined : true,
									} )
								);
							} }
						/>
					)
				}
			/>
		</Page>
	);
}
