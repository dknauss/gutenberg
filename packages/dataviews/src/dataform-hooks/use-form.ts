import { useEffect, useState } from 'react';
import { FormField } from '../types';

export const useForm = ( supportedFields: Record< string, FormField > ) => {
	const [ form, setForm ] = useState( {
		fields: supportedFields,
		touchedFields: [] as string[],
		errors: {},
	} );

	const setTouchedFields = ( touchedFields: string[] ) => {
		setForm( {
			...form,
			touchedFields,
		} );
	};

	const setError = ( field: string, error: string ) => {
		setForm( {
			...form,
			errors: {
				...form.errors,
				[ field ]: error,
			},
		} );
	};

	const isFormValid = () => {
		return Object.entries( form.fields ).every( ( [ , field ] ) => {
			if (
				field.validation.validateWhenDirty === true &&
				form.touchedFields.includes( field.id )
			) {
				return field.validation.callback().isValid;
			}

			return field.validation.callback().isValid;
		} );
	};

	return {
		...form,
		setTouchedFields,
		setError,
		isFormValid: isFormValid(),
	};
};
