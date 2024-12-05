/**
 * WordPress dependencies
 */
import type { Field } from '@wordpress/dataviews';

/**
 * Internal dependencies
 */
import { __ } from '@wordpress/i18n';
import type { BasePost } from '../../types';
import { TemplateEdit } from './template-edit';

const templateField: Field< BasePost > = {
	id: 'template',
	type: 'text',
	label: __( 'Template' ),
	getValue: ( { item } ) => item.template,
	Edit: TemplateEdit,
	enableSorting: false,
};

export default templateField;
