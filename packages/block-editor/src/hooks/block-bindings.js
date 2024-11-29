/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	getBlockBindingsSource,
	getBlockBindingsSources,
} from '@wordpress/blocks';
import {
	__experimentalItemGroup as ItemGroup,
	__experimentalItem as Item,
	__experimentalText as Text,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
	__experimentalVStack as VStack,
	Modal,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useContext, Fragment, useState } from '@wordpress/element';
import { useViewportMatch } from '@wordpress/compose';
import { connection } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import {
	canBindAttribute,
	getBindableAttributes,
} from '../hooks/use-bindings-attributes';
import InspectorControls from '../components/inspector-controls';
import BlockContext from '../components/block-context';
import { useBlockBindingsUtils } from '../utils/block-bindings';
import { store as blockEditorStore } from '../store';

const EMPTY_OBJECT = {};

const useToolsPanelDropdownMenuProps = () => {
	const isMobile = useViewportMatch( 'medium', '<' );
	return ! isMobile
		? {
				popoverProps: {
					placement: 'left-start',
					// For non-mobile, inner sidebar width (248px) - button width (24px) - border (1px) + padding (16px) + spacing (20px)
					offset: 259,
				},
		  }
		: {};
};

function BlockBindingsAttribute( { attribute, binding, fieldsList, onClick } ) {
	const { source: sourceName, args } = binding || {};
	const sourceProps = getBlockBindingsSource( sourceName );
	const isSourceInvalid = ! sourceProps;
	return (
		<VStack
			className="block-editor-bindings__item"
			spacing={ 0 }
			onClick={ onClick }
		>
			<Text truncate>{ attribute }</Text>
			{ !! binding && (
				<Text
					truncate
					variant={ ! isSourceInvalid && 'muted' }
					isDestructive={ isSourceInvalid }
				>
					{ isSourceInvalid
						? __( 'Invalid source' )
						: fieldsList?.[ sourceName ]?.[ args?.key ]?.label ||
						  sourceProps?.label ||
						  sourceName }
				</Text>
			) }
		</VStack>
	);
}

function ReadOnlyBlockBindingsPanelItems( { bindings, fieldsList, onClick } ) {
	return (
		<>
			{ Object.entries( bindings ).map( ( [ attribute, binding ] ) => (
				<Item key={ attribute } onClick={ onClick }>
					<BlockBindingsAttribute
						attribute={ attribute }
						binding={ binding }
						fieldsList={ fieldsList }
					/>
				</Item>
			) ) }
		</>
	);
}

function EditableBlockBindingsPanelItems( {
	attributes,
	bindings,
	fieldsList,
} ) {
	const { updateBlockBindings } = useBlockBindingsUtils();
	const [ isOuterModalOpen, setOuterModalOpen ] = useState( false );
	const dataSet = Object.entries( fieldsList[ 'core/post-meta' ] ).map(
		( [ key, field ] ) => {
			const value =
				field.value === undefined
					? `${ field.label } value`
					: field.value;

			return {
				id: key,
				label: field.label || key,
				value: value !== '' ? value : `Add a new ${ field.label } `,
			};
		}
	);

	const fields = [
		{
			id: 'label',
			label: 'Label',
			type: 'text',
			enableGlobalSearch: true,
		},
		{
			id: 'value',
			label: 'Value',
			type: 'text',
			enableGlobalSearch: true,
		},
	];
	const defaultLayouts = {
		table: {
			layout: {
				primaryField: 'label',
				styles: {
					label: {
						minWidth: 320,
					},
					value: {
						width: '50%',
						minWidth: 320,
					},
				},
			},
		},
	};
	const [ view, setView ] = useState( {
		type: 'table',
		search: '',
		filters: [],
		page: 1,
		perPage: 5,
		sort: {},
		fields: [ 'label', 'value' ],
		layout: defaultLayouts.table.layout,
	} );

	const { data: initialData, paginationInfo: initialPaginationInfo } =
		filterSortAndPaginate( dataSet, view, fields );
	const [ data, setData ] = useState( initialData );
	const [ paginationInfo, setPaginationInfo ] = useState(
		initialPaginationInfo
	);

	const actions = [
		{
			id: 'select',
			label: 'Select binding',
			isPrimary: true,
			icon: connection,
			callback: ( field ) => {
				updateBlockBindings( {
					content: {
						source: 'core/post-meta',
						args: { key: field[ 0 ].id },
					},
				} );
				setOuterModalOpen( false );
			},
		},
	];

	const onChangeView = ( newView ) => {
		const { data: newData, paginationInfo: newPaginationInfo } =
			filterSortAndPaginate( dataSet, newView, fields );
		setView( newView );
		setData( newData );
		setPaginationInfo( newPaginationInfo );
	};
	return (
		<>
			{ attributes.map( ( attribute ) => {
				const binding = bindings[ attribute ];
				return (
					<ToolsPanelItem
						key={ attribute }
						hasValue={ () => !! binding }
						label={ attribute }
						onDeselect={ () => {
							updateBlockBindings( {
								[ attribute ]: undefined,
							} );
						} }
						onSelect={ () => setOuterModalOpen( true ) }
					>
						<Item
							key={ attribute }
							onClick={ () => {
								setOuterModalOpen( true );
							} }
						>
							<BlockBindingsAttribute
								attribute={ attribute }
								binding={ binding }
								fieldsList={ fieldsList }
							/>
						</Item>
					</ToolsPanelItem>
				);
			} ) }
			{ isOuterModalOpen && (
				<Modal
					onRequestClose={ () => setOuterModalOpen( false ) }
					__experimentalHideHeader
					className="block-editor-bindings__modal"
				>
					<DataViews
						data={ data }
						fields={ fields }
						view={ view }
						defaultLayouts={ defaultLayouts }
						paginationInfo={ paginationInfo }
						actions={ actions }
						onChangeView={ onChangeView }
					/>
				</Modal>
			) }
		</>
	);
}

export const BlockBindingsPanel = ( { name: blockName, metadata } ) => {
	const blockContext = useContext( BlockContext );
	const { removeAllBlockBindings } = useBlockBindingsUtils();
	const bindableAttributes = getBindableAttributes( blockName );
	const dropdownMenuProps = useToolsPanelDropdownMenuProps();

	// `useSelect` is used purposely here to ensure `getFieldsList`
	// is updated whenever there are updates in block context.
	// `source.getFieldsList` may also call a selector via `select`.
	const _fieldsList = {};
	const { fieldsList, canUpdateBlockBindings } = useSelect(
		( select ) => {
			if ( ! bindableAttributes || bindableAttributes.length === 0 ) {
				return EMPTY_OBJECT;
			}
			const registeredSources = getBlockBindingsSources();
			Object.entries( registeredSources ).forEach(
				( [ sourceName, { getFieldsList, usesContext } ] ) => {
					if ( getFieldsList ) {
						// Populate context.
						const context = {};
						if ( usesContext?.length ) {
							for ( const key of usesContext ) {
								context[ key ] = blockContext[ key ];
							}
						}
						const sourceList = getFieldsList( {
							select,
							context,
						} );
						// Only add source if the list is not empty.
						if ( Object.keys( sourceList || {} ).length ) {
							_fieldsList[ sourceName ] = { ...sourceList };
						}
					}
				}
			);
			return {
				fieldsList:
					Object.values( _fieldsList ).length > 0
						? _fieldsList
						: EMPTY_OBJECT,
				canUpdateBlockBindings:
					select( blockEditorStore ).getSettings()
						.canUpdateBlockBindings,
			};
		},
		[ blockContext, bindableAttributes ]
	);
	// Return early if there are no bindable attributes.
	if ( ! bindableAttributes || bindableAttributes.length === 0 ) {
		return null;
	}
	// Filter bindings to only show bindable attributes and remove pattern overrides.
	const { bindings } = metadata || {};
	const filteredBindings = { ...bindings };
	Object.keys( filteredBindings ).forEach( ( key ) => {
		if (
			! canBindAttribute( blockName, key ) ||
			filteredBindings[ key ].source === 'core/pattern-overrides'
		) {
			delete filteredBindings[ key ];
		}
	} );

	// Lock the UI when the user can't update bindings or there are no fields to connect to.
	const readOnly =
		! canUpdateBlockBindings || ! Object.keys( fieldsList ).length;

	if ( readOnly && Object.keys( filteredBindings ).length === 0 ) {
		return null;
	}

	return (
		<InspectorControls group="bindings">
			<ToolsPanel
				label={ __( 'Attributes' ) }
				resetAll={ () => {
					removeAllBlockBindings();
				} }
				dropdownMenuProps={ dropdownMenuProps }
				className="block-editor-bindings__panel"
			>
				<ItemGroup isBordered isSeparated>
					{ readOnly ? (
						<div>
							<ReadOnlyBlockBindingsPanelItems
								bindings={ filteredBindings }
								fieldsList={ fieldsList }
							/>
						</div>
					) : (
						<EditableBlockBindingsPanelItems
							attributes={ bindableAttributes }
							bindings={ filteredBindings }
							fieldsList={ fieldsList }
						/>
					) }
				</ItemGroup>
				{ /*
					Use a div element to make the ToolsPanelHiddenInnerWrapper
					toggle the visibility of this help text automatically.
				*/ }
				<Text as="div" variant="muted">
					<p>
						{ __(
							'Attributes connected to custom fields or other dynamic data.'
						) }
					</p>
				</Text>
			</ToolsPanel>
		</InspectorControls>
	);
};

export default {
	edit: BlockBindingsPanel,
	attributeKeys: [ 'metadata' ],
	hasSupport() {
		return true;
	},
};
