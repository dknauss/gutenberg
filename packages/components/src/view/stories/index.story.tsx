/**
 * External dependencies
 */
import type { Meta, StoryFn } from '@storybook/react';

/**
 * Internal dependencies
 */
import { View } from '..';

const meta: Meta< typeof View > = {
	component: View,
	title: 'Components (Experimental)/View',
	argTypes: {
		as: { control: false },
		children: { control: { type: 'text' } },
	},
	parameters: {
		controls: { expanded: true },
		docs: { canvas: { sourceState: 'shown' } },
	},
};
export default meta;

const Template: StoryFn< typeof View > = ( args ) => {
	return <View { ...args } />;
};

export const Default: StoryFn< typeof View > = Template.bind( {} );
Default.args = {
	children: 'An example tip',
};
