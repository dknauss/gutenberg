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
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import type { Color, Gradient } from './types';

type Props = {
	colors: Color[] | Gradient[];
	type: 'colors' | 'gradients';
	templateColumns?: string | number;
};

const ColorExamples = ( {
	colors,
	type,
	templateColumns = '1fr 1fr',
}: Props ): JSX.Element | null => {
	if ( ! colors ) {
		return null;
	}

	return (
		<Grid templateColumns={ templateColumns } rowGap={ 8 } columnGap={ 16 }>
			{ colors.map( ( color: Color | Gradient ) => {
				const className =
					type === 'gradients'
						? __experimentalGetGradientClass( color.slug )
						: getColorClassName( 'background-color', color.slug );
				const classes = clsx(
					'edit-site-style-book__color-example',
					`edit-site-style-book__color-example__${ columns }-col`,
					className
				);

				return <View key={ color.slug } className={ classes } />;
			} ) }
		</Grid>
	);
};

export default ColorExamples;
