/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { BlockAlignmentControl } from '../';

/**
 * The `BlockAlignmentControl` component is used to render block alignment options in the editor. The different alignment options it provides are `left`, `center`, `right`, `wide` and `full`.
 *
 * If you want to use the block alignment control in a toolbar, you should use the `BlockAlignmentToolbar` component instead.
 */
const meta = {
	title: 'BlockEditor/BlockAlignmentControl',
	component: BlockAlignmentControl,
	argTypes: {
		value: {
			control: { type: null },
			defaultValue: 'undefined',
			description: 'The current value of the alignment setting.',
		},
		onChange: {
			action: 'onChange',
			control: { type: null },
			description:
				"A callback function invoked when the toolbar's alignment value is changed via an interaction with any of the toolbar's buttons. Called with the new alignment value (ie:`left`, `center`, `right`, `wide`, and `full`) as the only argument.",
		},
	},
};

export default meta;

export const Default = {
	render: function Template( { onChange, ...args } ) {
		const [ value, setValue ] = useState();
		return (
			<BlockAlignmentControl
				{ ...args }
				onChange={ ( ...changeArgs ) => {
					onChange( ...changeArgs );
					setValue( ...changeArgs );
				} }
				value={ value }
			/>
		);
	},
};
