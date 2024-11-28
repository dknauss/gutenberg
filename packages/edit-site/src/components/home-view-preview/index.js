/**
 * WordPress dependencies
 */

import { store as coreStore } from '@wordpress/core-data';
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */

import Editor from '../editor';
import { StyleBookPreview } from '../style-book';

export function HomeViewPreview() {
	const isBlockBasedTheme =
		select( coreStore ).getCurrentTheme()?.is_block_theme;

	// If theme is block based, return the Editor, otherwise return the StyleBookPreview.
	return isBlockBasedTheme ? <Editor /> : <StyleBookPreview />;
}
