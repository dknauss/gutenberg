/**
 * Internal dependencies
 */
import SidebarNavigationScreenMain from '../sidebar-navigation-screen-main';
import { StyleBookPreview } from '../style-book';

export const stylebookRoute = {
	name: 'stylebook',
	path: '/stylebook',
	areas: {
		sidebar: <SidebarNavigationScreenMain />,
		preview: <StyleBookPreview />,
		mobile: <StyleBookPreview />,
	},
};
