/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import {
	getBlockDefaultClassName,
	hasBlockSupport,
	getBlockType,
	store as blocksStore,
} from '@wordpress/blocks';
import { withFilters } from '@wordpress/components';
import { useRegistry, useSelect } from '@wordpress/data';
import { useCallback, useContext, useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import BlockContext from '../block-context';
import isURLLike from '../link-control/is-url-like';
import { unlock } from '../../lock-unlock';
import {
	canBindAttribute,
	DEFAULT_ATTRIBUTE,
	replacePatternOverrideDefaultBindings,
} from '../../hooks/use-bindings-attributes';

/**
 * Default value used for blocks which do not define their own context needs,
 * used to guarantee that a block's `context` prop will always be an object. It
 * is assigned as a constant since it is always expected to be an empty object,
 * and in order to avoid unnecessary React reconciliations of a changing object.
 *
 * @type {{}}
 */
const DEFAULT_BLOCK_CONTEXT = {};

const Edit = ( props ) => {
	const { name } = props;
	const blockType = getBlockType( name );

	if ( ! blockType ) {
		return null;
	}

	// `edit` and `save` are functions or components describing the markup
	// with which a block is displayed. If `blockType` is valid, assign
	// them preferentially as the render value for the block.
	const Component = blockType.edit || blockType.save;

	return <Component { ...props } />;
};

const EditWithFilters = withFilters( 'editor.BlockEdit' )( Edit );

const EditWithGeneratedProps = ( props ) => {
	const { name, clientId, attributes, setAttributes } = props;
	const hasPatternOverridesDefaultBinding =
		attributes?.metadata?.bindings?.[ DEFAULT_ATTRIBUTE ]?.source ===
		'core/pattern-overrides';
	const registry = useRegistry();
	const blockType = getBlockType( name );
	const blockContext = useContext( BlockContext );
	const sources = useSelect( ( select ) =>
		unlock( select( blocksStore ) ).getAllBlockBindingsSources()
	);

	const blockBindings = useMemo(
		() =>
			replacePatternOverrideDefaultBindings(
				name,
				attributes?.metadata?.bindings
			),
		[ attributes?.metadata?.bindings, name ]
	);

	// Assign context values using the block type's declared context needs.
	const context = useMemo( () => {
		return blockType && blockType.usesContext
			? Object.fromEntries(
					Object.entries( blockContext ).filter( ( [ key ] ) =>
						blockType.usesContext.includes( key )
					)
			  )
			: DEFAULT_BLOCK_CONTEXT;
	}, [ blockType, blockContext ] );

	const { computedAttributes, computedContext } = useSelect(
		( select ) => {
			if ( ! blockBindings ) {
				return {
					computedAttributes: attributes,
					computedContext: context,
				};
			}

			const attributesFromSources = {};
			const contextFromSources = {};
			const blockBindingsBySource = new Map();

			for ( const [ attributeName, binding ] of Object.entries(
				blockBindings
			) ) {
				const { source: sourceName, args: sourceArgs } = binding;
				const source = sources[ sourceName ];
				if ( ! source || ! canBindAttribute( name, attributeName ) ) {
					continue;
				}

				// Populate context.
				for ( const key of source.usesContext || [] ) {
					contextFromSources[ key ] = blockContext[ key ];
				}

				blockBindingsBySource.set( source, {
					...blockBindingsBySource.get( source ),
					[ attributeName ]: {
						args: sourceArgs,
					},
				} );
			}

			if ( blockBindingsBySource.size ) {
				for ( const [ source, bindings ] of blockBindingsBySource ) {
					// Get values in batch if the source supports it.
					let values = {};
					if ( ! source.getValues ) {
						Object.keys( bindings ).forEach( ( attr ) => {
							// Default to the the source label when `getValues` doesn't exist.
							values[ attr ] = source.label;
						} );
					} else {
						values = source.getValues( {
							select,
							context: contextFromSources,
							clientId,
							bindings,
						} );
					}
					for ( const [ attributeName, value ] of Object.entries(
						values
					) ) {
						if (
							attributeName === 'url' &&
							( ! value || ! isURLLike( value ) )
						) {
							// Return null if value is not a valid URL.
							attributesFromSources[ attributeName ] = null;
						} else {
							attributesFromSources[ attributeName ] = value;
						}
					}
				}
			}

			return {
				computedAttributes: {
					...attributes,
					...attributesFromSources,
				},
				computedContext: { ...context, ...contextFromSources },
			};
		},
		[
			attributes,
			blockBindings,
			blockContext,
			clientId,
			context,
			name,
			sources,
		]
	);

	const setBoundAttributes = useCallback(
		( nextAttributes ) => {
			if ( ! blockBindings ) {
				setAttributes( nextAttributes );
				return;
			}

			registry.batch( () => {
				const keptAttributes = { ...nextAttributes };
				const blockBindingsBySource = new Map();

				// Loop only over the updated attributes to avoid modifying the bound ones that haven't changed.
				for ( const [ attributeName, newValue ] of Object.entries(
					keptAttributes
				) ) {
					if (
						! blockBindings[ attributeName ] ||
						! canBindAttribute( name, attributeName )
					) {
						continue;
					}

					const binding = blockBindings[ attributeName ];
					const source = sources[ binding?.source ];
					if ( ! source?.setValues ) {
						continue;
					}
					blockBindingsBySource.set( source, {
						...blockBindingsBySource.get( source ),
						[ attributeName ]: {
							args: binding.args,
							newValue,
						},
					} );
					delete keptAttributes[ attributeName ];
				}

				if ( blockBindingsBySource.size ) {
					for ( const [
						source,
						bindings,
					] of blockBindingsBySource ) {
						source.setValues( {
							select: registry.select,
							dispatch: registry.dispatch,
							context: computedContext,
							clientId,
							bindings,
						} );
					}
				}

				const hasParentPattern =
					!! computedContext[ 'pattern/overrides' ];

				if (
					// Don't update non-connected attributes if the block is using pattern overrides
					// and the editing is happening while overriding the pattern (not editing the original).
					! (
						hasPatternOverridesDefaultBinding && hasParentPattern
					) &&
					Object.keys( keptAttributes ).length
				) {
					// Don't update caption and href until they are supported.
					if ( hasPatternOverridesDefaultBinding ) {
						delete keptAttributes.caption;
						delete keptAttributes.href;
					}
					setAttributes( keptAttributes );
				}
			} );
		},
		[
			blockBindings,
			clientId,
			computedContext,
			hasPatternOverridesDefaultBinding,
			setAttributes,
			sources,
			name,
			registry,
		]
	);

	if ( ! blockType ) {
		return null;
	}

	if ( blockType.apiVersion > 1 ) {
		return (
			<EditWithFilters
				{ ...props }
				attributes={ computedAttributes }
				context={ computedContext }
				setAttributes={ setBoundAttributes }
			/>
		);
	}

	// Generate a class name for the block's editable form.
	const generatedClassName = hasBlockSupport( blockType, 'className', true )
		? getBlockDefaultClassName( name )
		: null;
	const className = clsx(
		generatedClassName,
		attributes?.className,
		props.className
	);

	return (
		<EditWithFilters
			{ ...props }
			attributes={ computedAttributes }
			className={ className }
			context={ computedContext }
			setAttributes={ setBoundAttributes }
		/>
	);
};

export default EditWithGeneratedProps;
