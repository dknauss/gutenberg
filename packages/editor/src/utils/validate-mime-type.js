/**
 * WordPress dependencies
 */
import { select } from '@wordpress/data';
import {
	validateMimeType as originalValidateMimeType,
	validateMimeTypeForUser as originalValidateMimeTypeForUser,
} from '@wordpress/media-utils';

/**
 * Internal dependencies
 */
import { store as editorStore } from '../store';

/**
 * Verifies if the caller (e.g. a block) supports this mime type.
 *
 * @param {File}     file           File object.
 * @param {string[]} [allowedTypes] Array with the types of media that can be uploaded, if unset all types are allowed.
 */
export function validateMimeType( file, allowedTypes ) {
	const { getEditorSettings } = select( editorStore );
	const wpAllowedMimeTypes = getEditorSettings().allowedMimeTypes;

	originalValidateMimeTypeForUser( file, wpAllowedMimeTypes );
	originalValidateMimeType( file, allowedTypes );
}
