/**
 * Internal dependencies
 */
import SidebarNavigationScreenMain from '../sidebar-navigation-screen-main';
import { HomeViewPreview } from '../home-view-preview';

export const homeRoute = {
	name: 'home',
	path: '/',
	areas: {
		sidebar: <SidebarNavigationScreenMain />,
		preview: <HomeViewPreview />,
		mobile: <HomeViewPreview />,
	},
};
