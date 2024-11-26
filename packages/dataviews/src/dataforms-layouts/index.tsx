/**
 * Internal dependencies
 */
import FormRegularField from './regular';
import FormPanelField from './panel';

const FORM_FIELD_LAYOUTS = [
	{
		type: 'regular',
		component: FormRegularField,
		supportsBulk: true,
	},
	{
		type: 'panel',
		component: FormPanelField,
		supportsBulk: true,
	},
];

export function getFormFieldLayout( type: string ) {
	return FORM_FIELD_LAYOUTS.find( ( layout ) => layout.type === type );
}
