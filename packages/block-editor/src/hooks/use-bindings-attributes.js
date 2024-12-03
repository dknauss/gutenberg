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

export const DEFAULT_ATTRIBUTE = '__default';

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
export function replacePatternOverrideDefaultBindings( blockName, bindings ) {
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
