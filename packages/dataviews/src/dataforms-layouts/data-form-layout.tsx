/**
 * WordPress dependencies
 */
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useContext, useEffect, useMemo } from '@wordpress/element';

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
	const { fields: fieldDefinitions } = useContext( DataFormContext );

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

	const { setTouchedFields, setErrors, touchedFields, messageErrors } = form;

	useEffect( () => {
		normalizedFormFields.forEach( ( formField ) => {
			const { isValid, errorMessage } = formField.validation.callback( {
				...data,
			} );
			if ( ! isValid ) {
				setErrors( formField.id, errorMessage );
			} else {
				setErrors( formField.id, undefined );
			}
		} );
	}, [ data, normalizedFormFields, setErrors ] );

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

				return (
					<FieldLayout
						key={ formField.id }
						data={ data }
						field={ formField }
						errorMessage={
							( formField.validation.showErrorOnlyWhenDirty &&
								touchedFields.includes( formField.id ) ) ||
							( ! formField.validation.showErrorOnlyWhenDirty &&
								messageErrors[ formField.id ] )
								? messageErrors[ formField.id ]
								: undefined
						}
						onChange={ ( value ) => {
							if ( ! touchedFields.includes( formField.id ) ) {
								setTouchedFields( [
									// @ts-ignore
									...form.touchedFields,
									formField.id,
								] );
							}

							onChange( value );
							const { isValid, errorMessage } =
								formField.validation.callback( {
									...data,
									...value,
								} );
							if ( ! isValid ) {
								setErrors( formField.id, errorMessage );
							} else {
								setErrors( formField.id, undefined );
							}
						} }
					/>
				);
			} ) }
		</VStack>
	);
}
