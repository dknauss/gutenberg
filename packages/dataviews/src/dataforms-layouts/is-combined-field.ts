/**
 * Internal dependencies
 */
import { NormalizedFormField } from '../normalize-form-fields';
import type { FormField, CombinedFormField, NormalizedField } from '../types';

export function isCombinedField(
	field: FormField | NormalizedFormField
): field is CombinedFormField {
	return ( field as CombinedFormField ).children !== undefined;
}
