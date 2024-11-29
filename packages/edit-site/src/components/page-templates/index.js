/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useMemo, useCallback, useEffect } from '@wordpress/element';
import {
	privateApis as corePrivateApis,
	store as coreStore,
} from '@wordpress/core-data';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { privateApis as routerPrivateApis } from '@wordpress/router';
import { privateApis as editorPrivateApis } from '@wordpress/editor';
import { addQueryArgs } from '@wordpress/url';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import Page from '../page';
import AddNewTemplate from '../add-new-template';
import {
	TEMPLATE_POST_TYPE,
	OPERATOR_IS_ANY,
	LAYOUT_GRID,
	LAYOUT_TABLE,
	LAYOUT_LIST,
} from '../../utils/constants';
import { unlock } from '../../lock-unlock';
import {
	useEditPostAction,
	useSetActiveTemplateAction,
} from '../dataviews-actions';
import {
	authorField,
	descriptionField,
	previewField,
	titleField,
	activeField,
	slugField,
} from './fields';
import { useDefaultTemplateTypes } from '../add-new-template/utils';

const { usePostActions } = unlock( editorPrivateApis );
const { useHistory, useLocation } = unlock( routerPrivateApis );
const { useEntityRecordsWithPermissions } = unlock( corePrivateApis );

const defaultLayouts = {
	[ LAYOUT_TABLE ]: {
		fields: [ 'template', 'author', 'active', 'slug' ],
		layout: {
			primaryField: 'title',
			combinedFields: [
				{
					id: 'template',
					label: __( 'Template' ),
					children: [ 'title', 'description' ],
					direction: 'vertical',
				},
			],
			styles: {
				template: {
					maxWidth: 400,
					minWidth: 320,
				},
				preview: {
					width: '1%',
				},
				author: {
					width: '1%',
				},
			},
		},
	},
	[ LAYOUT_GRID ]: {
		fields: [ 'title', 'description', 'author', 'active', 'slug' ],
		layout: {
			mediaField: 'preview',
			primaryField: 'title',
			columnFields: [ 'description' ],
			badgeFields: [ 'active', 'slug' ],
		},
	},
	[ LAYOUT_LIST ]: {
		fields: [ 'title', 'description', 'author', 'active', 'slug' ],
		layout: {
			primaryField: 'title',
		},
	},
};

const DEFAULT_VIEW = {
	type: LAYOUT_GRID,
	search: '',
	page: 1,
	perPage: 20,
	sort: {
		field: 'title',
		direction: 'asc',
	},
	fields: defaultLayouts[ LAYOUT_GRID ].fields,
	layout: defaultLayouts[ LAYOUT_GRID ].layout,
	filters: [],
};

export default function PageTemplates() {
	const { path, query } = useLocation();
	const { activeView = 'active', layout, postId } = query;
	const [ selection, setSelection ] = useState( [ postId ] );
	const defaultView = useMemo( () => {
		const usedType = layout ?? DEFAULT_VIEW.type;
		return {
			...DEFAULT_VIEW,
			type: usedType,
			layout: defaultLayouts[ usedType ].layout,
			fields: defaultLayouts[ usedType ].fields,
			filters: ! [ 'active', 'user' ].includes( activeView )
				? [
						{
							field: 'author',
							operator: 'isAny',
							value: [ activeView ],
						},
				  ]
				: [],
		};
	}, [ layout, activeView ] );
	const [ view, setView ] = useState( defaultView );
	useEffect( () => {
		const usedType = layout ?? DEFAULT_VIEW.type;
		setView( ( currentView ) => ( {
			...currentView,
			type: usedType,
			filters: ! [ 'active', 'user' ].includes( activeView )
				? [
						{
							field: 'author',
							operator: OPERATOR_IS_ANY,
							value: [ activeView ],
						},
				  ]
				: [],
		} ) );
	}, [ activeView, layout ] );

	const activeTemplatesOption = useSelect(
		( select ) =>
			select( coreStore ).getEntityRecord( 'root', 'site' )
				?.active_templates
	);
	const defaultTemplateTypes = useDefaultTemplateTypes();
	// Todo: this will have to be better so that we're not fetching all the
	// records all the time. Active templates query will need to move server
	// side.
	const { records: userRecords, isResolving: isLoadingUserRecords } =
		useEntityRecordsWithPermissions( 'postType', TEMPLATE_POST_TYPE, {
			per_page: -1,
		} );
	const { records: staticRecords, isResolving: isLoadingStaticData } =
		useEntityRecordsWithPermissions( 'postType', '_wp_static_template', {
			per_page: -1,
		} );

	const activeTemplates = useMemo( () => {
		const _active = [ ...staticRecords ];
		if ( activeTemplatesOption ) {
			for ( const activeSlug in activeTemplatesOption ) {
				const activeId = activeTemplatesOption[ activeSlug ];
				if ( activeId === false ) {
					// Remove the template from the array.
					const index = _active.findIndex(
						( template ) => template.slug === activeSlug
					);
					if ( index !== -1 ) {
						_active.splice( index, 1 );
					}
				} else {
					// Replace the template in the array.
					const template = userRecords.find(
						( { id } ) => id === activeId
					);
					if ( template ) {
						const index = _active.findIndex(
							( { slug } ) => slug === template.slug
						);
						if ( index !== -1 ) {
							_active[ index ] = template;
						} else {
							_active.push( template );
						}
					}
				}
			}
		}
		const defaultSlugs = defaultTemplateTypes.map( ( type ) => type.slug );
		return _active.filter( ( template ) =>
			defaultSlugs.includes( template.slug )
		);
	}, [
		defaultTemplateTypes,
		userRecords,
		staticRecords,
		activeTemplatesOption,
	] );

	let _records;
	let isLoadingData;
	if ( activeView === 'active' ) {
		_records = activeTemplates;
		isLoadingData = isLoadingUserRecords || isLoadingStaticData;
	} else if ( activeView === 'user' ) {
		_records = userRecords;
		isLoadingData = isLoadingUserRecords;
	} else {
		_records = staticRecords;
		isLoadingData = isLoadingStaticData;
	}

	const records = useMemo( () => {
		return _records.map( ( record ) => ( {
			...record,
			_isActive:
				typeof record.id === 'string'
					? activeTemplatesOption[ record.slug ] === record.id ||
					  ( activeTemplatesOption[ record.slug ] === undefined &&
							defaultTemplateTypes.find(
								( { slug } ) => slug === record.slug
							) )
					: Object.values( activeTemplatesOption ).includes(
							record.id
					  ),
		} ) );
	}, [ _records, activeTemplatesOption, defaultTemplateTypes ] );

	const users = useSelect(
		( select ) => {
			const { getUser } = select( coreStore );
			return records.reduce( ( acc, record ) => {
				if ( record.author_text ) {
					if ( ! acc[ record.author_text ] ) {
						acc[ record.author_text ] = record.author_text;
					}
				} else if ( record.author ) {
					if ( ! acc[ record.author ] ) {
						acc[ record.author ] = getUser( record.author );
					}
				}
				return acc;
			}, {} );
		},
		[ records ]
	);

	const history = useHistory();
	const onChangeSelection = useCallback(
		( items ) => {
			setSelection( items );
			if ( view?.type === LAYOUT_LIST ) {
				history.navigate(
					addQueryArgs( path, {
						postId: items.length === 1 ? items[ 0 ] : undefined,
					} )
				);
			}
		},
		[ history, path, view?.type ]
	);

	const fields = useMemo( () => {
		const _fields = [
			previewField,
			titleField,
			descriptionField,
			activeField,
			slugField,
		];
		if ( [ 'active', 'user' ].includes( activeView ) ) {
			const elements = [];
			for ( const author in users ) {
				elements.push( {
					value: users[ author ]?.id ?? author,
					label: users[ author ]?.name ?? author,
				} );
			}
			_fields.push( {
				...authorField,
				elements,
			} );
		}
		return _fields;
	}, [ users, activeView ] );

	const { data, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( records, view, fields );
	}, [ records, view, fields ] );

	const postTypeActions = usePostActions( {
		postType: TEMPLATE_POST_TYPE,
		context: 'list',
	} );
	const editAction = useEditPostAction();
	const setActiveTemplateAction = useSetActiveTemplateAction();
	const actions = useMemo(
		() =>
			activeView === 'user'
				? [ setActiveTemplateAction, editAction, ...postTypeActions ]
				: [ setActiveTemplateAction, ...postTypeActions ],
		[ postTypeActions, setActiveTemplateAction, editAction, activeView ]
	);

	const onChangeView = useCallback(
		( newView ) => {
			if ( newView.type !== view.type ) {
				history.navigate(
					addQueryArgs( path, {
						layout: newView.type,
					} )
				);
			}

			setView( newView );
		},
		[ view.type, setView, history, path ]
	);

	return (
		<Page
			className="edit-site-page-templates"
			title={ __( 'Templates' ) }
			actions={ <AddNewTemplate /> }
		>
			<DataViews
				key={ activeView }
				paginationInfo={ paginationInfo }
				fields={ fields }
				actions={ actions }
				data={ data }
				isLoading={ isLoadingData }
				view={ view }
				onChangeView={ onChangeView }
				onChangeSelection={ onChangeSelection }
				selection={ selection }
				defaultLayouts={ defaultLayouts }
			/>
		</Page>
	);
}
