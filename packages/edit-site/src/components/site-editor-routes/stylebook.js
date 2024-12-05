/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import SidebarNavigationScreen from '../sidebar-navigation-screen';
import { StyleBookPreview } from '../style-book';

export const stylebookRoute = {
	name: 'stylebook',
	path: '/stylebook',
	areas: {
		sidebar: (
			<SidebarNavigationScreen
				title={ __( 'Styles' ) }
				backPath="/"
				description={ __( 'Theme style book.' ) }
			/>
		),
		preview: <StyleBookPreview />,
		mobile: <StyleBookPreview />,
	},
};
