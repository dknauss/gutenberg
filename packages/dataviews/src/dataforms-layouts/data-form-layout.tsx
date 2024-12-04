/**
 * WordPress dependencies
 */
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useContext, useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type {
	CombinedFormField,
	Form,
	FormField,
	NormalizedField,
	SimpleFormField,
} from '../types';
import { getFormFieldLayout } from './index';
import DataFormContext from '../components/dataform-context';
import { isCombinedField } from './is-combined-field';
import normalizeFormFields from '../normalize-form-fields';

function doesCombinedFieldSupportBulkEdits< Item >(
	combinedField: CombinedFormField,
	fieldDefinitions: NormalizedField< Item >[]
): boolean {
	return combinedField.children.some( ( child ) => {
		const fieldId = typeof child === 'string' ? child : child.id;

		return fieldDefinitions.find(
			( fieldDefinition ) => fieldDefinition.id === fieldId
		)?.supportsBulkEditing;
	} );
}

export function DataFormLayout< Item >( {
	data,
	form,
	onChange,
	children,
}: {
	data: Item | Item[];
	form: Form;
	onChange: ( value: any ) => void;
	children?: (
		FieldLayout: ( props: {
			data: Item | Item[];
			field: FormField;
			onChange: ( value: any ) => void;
			hideLabelFromVision?: boolean;
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

				if (
					Array.isArray( data ) &&
					( ( isCombinedField( formField ) &&
						! doesCombinedFieldSupportBulkEdits(
							formField,
							fieldDefinitions
						) ) ||
						( fieldDefinition &&
							! fieldDefinition.supportsBulkEditing ) )
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
						onChange={ onChange }
					/>
				);
			} ) }
		</VStack>
	);
}
