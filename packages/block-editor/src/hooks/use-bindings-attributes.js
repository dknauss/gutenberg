/**
 * WordPress dependencies
 */
import { store as blocksStore } from '@wordpress/blocks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useRegistry, useSelect } from '@wordpress/data';
import { useCallback, useMemo } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { unlock } from '../lock-unlock';

/** @typedef {import('@wordpress/compose').WPHigherOrderComponent} WPHigherOrderComponent */
/** @typedef {import('@wordpress/blocks').WPBlockSettings} WPBlockSettings */

/**
 * Given a binding of block attributes, returns a higher order component that
 * overrides its `attributes` and `setAttributes` props to sync any changes needed.
 *
 * @return {WPHigherOrderComponent} Higher-order component.
 */

const BLOCK_BINDINGS_ALLOWED_BLOCKS = {
	'core/paragraph': [ 'content' ],
	'core/heading': [ 'content' ],
	'core/image': [ 'id', 'url', 'title', 'alt' ],
	'core/button': [ 'url', 'text', 'linkTarget', 'rel' ],
};

const DEFAULT_ATTRIBUTE = '__default';

/**
 * Returns the bindings with the `__default` binding for pattern overrides
 * replaced with the full-set of supported attributes. e.g.:
 *
 * bindings passed in: `{ __default: { source: 'core/pattern-overrides' } }`
 * bindings returned: `{ content: { source: 'core/pattern-overrides' } }`
 *
 * @param {string} blockName The block name (e.g. 'core/paragraph').
 * @param {Object} bindings  A block's bindings from the metadata attribute.
 *
 * @return {Object} The bindings with default replaced for pattern overrides.
 */
function replacePatternOverrideDefaultBindings( blockName, bindings ) {
	// The `__default` binding currently only works for pattern overrides.
	if (
		bindings?.[ DEFAULT_ATTRIBUTE ]?.source === 'core/pattern-overrides'
	) {
		const supportedAttributes = BLOCK_BINDINGS_ALLOWED_BLOCKS[ blockName ];
		const bindingsWithDefaults = {};
		for ( const attributeName of supportedAttributes ) {
			// If the block has mixed binding sources, retain any non pattern override bindings.
			const bindingSource = bindings[ attributeName ]
				? bindings[ attributeName ]
				: { source: 'core/pattern-overrides' };
			bindingsWithDefaults[ attributeName ] = bindingSource;
		}

		return bindingsWithDefaults;
	}

	return bindings;
}

/**
 * Based on the given block name,
 * check if it is possible to bind the block.
 *
 * @param {string} blockName - The block name.
 * @return {boolean} Whether it is possible to bind the block to sources.
 */
export function canBindBlock( blockName ) {
	return blockName in BLOCK_BINDINGS_ALLOWED_BLOCKS;
}

/**
 * Based on the given block name and attribute name,
 * check if it is possible to bind the block attribute.
 *
 * @param {string} blockName     - The block name.
 * @param {string} attributeName - The attribute name.
 * @return {boolean} Whether it is possible to bind the block attribute.
 */
export function canBindAttribute( blockName, attributeName ) {
	return (
		canBindBlock( blockName ) &&
		BLOCK_BINDINGS_ALLOWED_BLOCKS[ blockName ].includes( attributeName )
	);
}

export function getBindableAttributes( blockName ) {
	return BLOCK_BINDINGS_ALLOWED_BLOCKS[ blockName ];
}

export const withBlockBindingSupport = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const registry = useRegistry();
		const sources = useSelect( ( select ) =>
			unlock( select( blocksStore ) ).getAllBlockBindingsSources()
		);
		const { name, clientId, context, setAttributes } = props;
		const blockBindings = useMemo(
			() =>
				replacePatternOverrideDefaultBindings(
					name,
					props.attributes.metadata?.bindings
				),
			[ props.attributes.metadata?.bindings, name ]
		);

		const hasParentPattern = !! context[ 'pattern/overrides' ];
		const hasPatternOverridesDefaultBinding =
			props.attributes.metadata?.bindings?.[ DEFAULT_ATTRIBUTE ]
				?.source === 'core/pattern-overrides';

		const _setAttributes = useCallback(
			( nextAttributes ) => {
				registry.batch( () => {
					if ( ! blockBindings ) {
						setAttributes( nextAttributes );
						return;
					}

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
								context,
								clientId,
								bindings,
							} );
						}
					}

					if (
						// Don't update non-connected attributes if the block is using pattern overrides
						// and the editing is happening while overriding the pattern (not editing the original).
						! (
							hasPatternOverridesDefaultBinding &&
							hasParentPattern
						) &&
						Object.keys( keptAttributes ).length
					) {
						// Don't update caption and href until they are supported.
						if ( hasPatternOverridesDefaultBinding ) {
							delete keptAttributes?.caption;
							delete keptAttributes?.href;
						}
						setAttributes( keptAttributes );
					}
				} );
			},
			[
				registry,
				blockBindings,
				name,
				clientId,
				context,
				setAttributes,
				sources,
				hasPatternOverridesDefaultBinding,
				hasParentPattern,
			]
		);

		return <BlockEdit { ...props } setAttributes={ _setAttributes } />;
	},
	'withBlockBindingSupport'
);

/**
 * Filters a registered block's settings to enhance a block's `edit` component
 * to upgrade bound attributes.
 *
 * @param {WPBlockSettings} settings - Registered block settings.
 * @param {string}          name     - Block name.
 * @return {WPBlockSettings} Filtered block settings.
 */
function shimAttributeSource( settings, name ) {
	if ( ! canBindBlock( name ) ) {
		return settings;
	}

	return {
		...settings,
		edit: withBlockBindingSupport( settings.edit ),
	};
}

addFilter(
	'blocks.registerBlockType',
	'core/editor/custom-sources-backwards-compatibility/shim-attribute-source',
	shimAttributeSource
);
