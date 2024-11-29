/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { __experimentalGrid as Grid } from '@wordpress/components';
import { View } from '@wordpress/primitives';
import {
	getColorClassName,
	__experimentalGetGradientClass,
	// @ts-ignore
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import type { Color, Gradient, ColorExampleProps } from './types';

const ColorExamples = ( {
	colors,
	type,
}: ColorExampleProps ): JSX.Element | null => {
	if ( ! colors ) {
		return null;
	}

	return (
		<Grid columns={ 2 } rowGap={ 8 } columnGap={ 16 }>
			{ colors.map( ( color: Color | Gradient ) => {
				const className =
					type === 'gradients'
						? __experimentalGetGradientClass( color.slug )
						: getColorClassName( 'background-color', color.slug );
				const classes = clsx(
					'edit-site-style-book__color-example',
					className
				);

				return <View key={ color.slug } className={ classes } />;
			} ) }
		</Grid>
	);
};

export default ColorExamples;
