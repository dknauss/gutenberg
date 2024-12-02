/**
 * WordPress dependencies
 */

import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */

import Editor from '../editor';

export function HomeViewPreview() {
	const { isBlockBasedTheme, siteUrl } = useSelect( ( select ) => {
		const { getEntityRecord, getCurrentTheme } = select( coreStore );
		const siteData = getEntityRecord( 'root', '__unstableBase' );

		return {
			isBlockBasedTheme: getCurrentTheme()?.is_block_theme,
			siteUrl: siteData?.home,
		};
	}, [] );

	// If theme is block based, return the Editor, otherwise return the site preview.
	return isBlockBasedTheme ? (
		<Editor />
	) : (
		<iframe
			src={ siteUrl }
			title="front-end view"
			style={ {
				display: 'block',
				width: '100%',
				height: '100%',
			} }
			onLoad={ ( event ) => {
				// Hide the admin bar in the front-end preview.
				const document = event.target.contentDocument;
				document.getElementById( 'wpadminbar' ).remove();
				// Make links unclickable.
				const links = document.getElementsByTagName( 'a' );
				Array.from( links ).forEach( ( link ) => {
					link.style.pointerEvents = 'none';
				} );
			} }
		/>
	);
}
