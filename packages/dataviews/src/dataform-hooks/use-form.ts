/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type { FormField } from '../types';

export const useForm = < Item >(
	supportedFields: Record< string, FormField >
) => {
	const [ form, setForm ] = useState( {
		fields: supportedFields,
		touchedFields: [] as string[],
		messageErrors: {},
	} );

	const setTouchedFields = ( touchedFields: string[] ) => {
		setForm( {
			...form,
			touchedFields,
		} );
	};

	const setErrors = ( field: string, error: string | undefined ) => {
		setForm( {
			...form,
			messageErrors: {
				...form.messageErrors,
				[ field ]: error,
			},
		} );
	};

	const isFormValid = ( data: Item ) => {
		return Object.entries( form.fields ).every( ( [ , field ] ) => {
			return field.validation.callback( data ).isValid;
		} );
	};

	return {
		...form,
		setTouchedFields,
		setErrors,
		isFormValid,
	};
};
