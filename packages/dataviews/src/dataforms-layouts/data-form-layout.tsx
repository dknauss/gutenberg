/**
 * WordPress dependencies
 */
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useContext, useEffect, useMemo, useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type { Form, FormField, SimpleFormField } from '../types';
import { getFormFieldLayout } from './index';
import DataFormContext from '../components/dataform-context';
import { isCombinedField } from './is-combined-field';
import normalizeFormFields from '../normalize-form-fields';

export function DataFormLayout< Item >( {
	data,
	form,
	onChange,
	children,
}: {
	data: Item;
	form: Form;
	onChange: ( value: any ) => void;
	children?: (
		FieldLayout: ( props: {
			data: Item;
			field: FormField;
			onChange: ( value: any ) => void;
			hideLabelFromVision?: boolean;
			errorMessage: string | undefined;
		} ) => React.JSX.Element | null,
		field: FormField
	) => React.JSX.Element;
} ) {
	const { fields: fieldDefinitions, validation } =
		useContext( DataFormContext );

	function getFieldDefinition( field: SimpleFormField | string ) {
		const fieldId = typeof field === 'string' ? field : field.id;

		return fieldDefinitions.find(
			( fieldDefinition ) => fieldDefinition.id === fieldId
		);
	}

	const normalizedFormFields = useMemo(
		() => normalizeFormFields( form ),
		[ form ]
	);

	const firstValidationRunRef = useRef( false );

	useEffect( () => {
		if ( firstValidationRunRef.current ) {
			return;
		}
		fieldDefinitions.forEach( ( fieldDefinition ) => {
			const errors = Object.entries(
				fieldDefinition?.validationCallbacks ?? {}
			).reduce( ( acc, [ key, callback ] ) => {
				const value = fieldDefinition.getValue( { item: data } );
				const error = callback( value );
				if ( ! error ) {
					return acc;
				}

				return {
					...acc,
					[ key ]: error,
				};
			}, {} );
			if ( Object.keys( errors ).length ) {
				validation.setErrors( fieldDefinition.id, errors );
			}
			firstValidationRunRef.current = true;
		} );
	}, [ data, fieldDefinitions, validation ] );

	return (
		<VStack spacing={ 2 }>
			{ normalizedFormFields.map( ( formField ) => {
				const FieldLayout = getFormFieldLayout( formField.layout )
					?.component;

				if ( ! FieldLayout ) {
					return null;
				}

				const fieldDefinition = ! isCombinedField( formField )
					? getFieldDefinition( formField )
					: undefined;

				if (
					fieldDefinition &&
					fieldDefinition.isVisible &&
					! fieldDefinition.isVisible( data )
				) {
					return null;
				}

				if ( children ) {
					return children( FieldLayout, formField );
				}

				const errorMessage =
					( fieldDefinition?.validationSchema?.onTouched &&
						validation.touchedFields.includes(
							fieldDefinition.id
						) ) ||
					! fieldDefinition?.validationSchema?.onTouched
						? Object.values(
								validation.errorMessages[ formField.id ] ?? []
						  )[ 0 ]
						: '';

				return (
					<FieldLayout
						key={ formField.id }
						data={ data }
						field={ formField }
						errorMessage={ errorMessage }
						onChange={ ( value ) => {
							onChange( value );
							if (
								! validation.touchedFields?.includes(
									formField.id
								)
							) {
								validation.setTouchedFields( [
									...validation.touchedFields,
									formField.id,
								] );
							}

							// Run validation callbacks
							const errors = Object.entries(
								fieldDefinition?.validationCallbacks ?? {}
							).reduce( ( acc, [ key, callback ] ) => {
								const error = callback( value[ formField.id ] );
								if ( ! error ) {
									return acc;
								}

								return {
									...acc,
									[ key ]: error,
								};
							}, {} );

							validation.setErrors( formField.id, errors );
						} }
					/>
				);
			} ) }
		</VStack>
	);
}
