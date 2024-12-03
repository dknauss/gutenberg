/**
 * WordPress dependencies
 */
import {
	__experimentalParseQuantityAndUnitFromRawValue as parseQuantityAndUnitFromRawValue,
	__experimentalUnitControl as UnitControl,
	Tooltip,
	RangeControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { getAllValue } from './utils';

const CORNERS = {
	all: __( 'Border radius' ),
	topLeft: __( 'Top left' ),
	topRight: __( 'Top right' ),
	bottomLeft: __( 'Bottom left' ),
	bottomRight: __( 'Bottom right' ),
};
const MIN_BORDER_RADIUS_VALUE = 0;
const MAX_BORDER_RADIUS_VALUES = {
	px: 100,
	em: 20,
	rem: 20,
};

export default function SingleInputControl( {
	corner,
	onChange,
	selectedUnits,
	setSelectedUnits,
	values: valuesProp,
	units,
} ) {
	const onChangeValue = ( next ) => {
		if ( ! onChange ) {
			return;
		}

		// Filter out CSS-unit-only values to prevent invalid styles.
		const isNumeric = ! isNaN( parseFloat( next ) );
		const nextValue = isNumeric ? next : undefined;
		if ( corner === 'all' ) {
			onChange( {
				topLeft: nextValue,
				topRight: nextValue,
				bottomLeft: nextValue,
				bottomRight: nextValue,
			} );
		} else {
			onChange( {
				...values,
				[ corner ]: nextValue,
			} );
		}
	};

	const onChangeUnit = ( next ) => {
		const newUnits = { ...selectedUnits };
		if ( corner === 'all' ) {
			newUnits.topLeft = next;
			newUnits.topRight = next;
			newUnits.bottomLeft = next;
			newUnits.bottomRight = next;
		} else {
			newUnits[ corner ] = next;
		}
		setSelectedUnits( newUnits );
	};

	// For shorthand style & backwards compatibility, handle flat string value.
	const values =
		typeof valuesProp !== 'string'
			? valuesProp
			: {
					topLeft: valuesProp,
					topRight: valuesProp,
					bottomLeft: valuesProp,
					bottomRight: valuesProp,
			  };

	const value = corner === 'all' ? getAllValue( values ) : values[ corner ];
	const [ parsedQuantity, parsedUnit ] =
		parseQuantityAndUnitFromRawValue( value );
	const computedUnit = value
		? parsedUnit
		: selectedUnits[ corner ] || selectedUnits.flat;
	const unitConfig =
		units && units.find( ( item ) => item.value === computedUnit );
	const step = unitConfig?.step || 1;
	const handleSliderChange = ( next ) => {
		const val =
			next !== undefined ? `${ next }${ computedUnit }` : undefined;
		if ( corner === 'all' ) {
			onChange( {
				topLeft: val,
				topRight: val,
				bottomLeft: val,
				bottomRight: val,
			} );
		} else {
			onChange( {
				...values,
				[ corner ]: val,
			} );
		}
	};

	// Controls are wrapped in tooltips as visible labels aren't desired here.
	// Tooltip rendering also requires the UnitControl to be wrapped. See:
	// https://github.com/WordPress/gutenberg/pull/24966#issuecomment-685875026
	return (
		<div className="components-border-radius-control__input-controls-wrapper">
			<Tooltip text={ CORNERS[ corner ] } placement="top">
				<div className="components-border-radius-control__tooltip-wrapper">
					<UnitControl
						className="components-border-radius-control__unit-control"
						aria-label={ CORNERS[ corner ] }
						value={ [ parsedQuantity, computedUnit ].join( '' ) }
						onChange={ onChangeValue }
						onUnitChange={ onChangeUnit }
						size="__unstable-large"
						min={ MIN_BORDER_RADIUS_VALUE }
						units={ units }
					/>
				</div>
			</Tooltip>
			<RangeControl
				__next40pxDefaultSize
				label={ __( 'Border radius' ) }
				hideLabelFromVision
				className="components-border-radius-control__range-control"
				value={ parsedQuantity ?? '' }
				min={ MIN_BORDER_RADIUS_VALUE }
				max={ MAX_BORDER_RADIUS_VALUES[ computedUnit ] }
				initialPosition={ 0 }
				withInputField={ false }
				onChange={ handleSliderChange }
				step={ step }
				__nextHasNoMarginBottom
			/>
		</div>
	);
}
