/**
 * WordPress dependencies
 */
import { select } from '@wordpress/data';
import { validateFileSize as originalValidateFileSize } from '@wordpress/media-utils';

/**
 * Internal dependencies
 */
import { store as editorStore } from '../store';

/**
 * Verifies whether the file is within the file upload size limits for the site.
 *
 * @param {File} file File object.
 */
export function validateFileSize( file ) {
	const { getEditorSettings } = select( editorStore );
	return originalValidateFileSize(
		file,
		getEditorSettings().maxUploadFileSize
	);
}
