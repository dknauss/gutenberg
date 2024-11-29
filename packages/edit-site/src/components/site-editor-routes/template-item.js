/**
 * Internal dependencies
 */
import Editor from '../editor';
import SidebarNavigationScreenTemplatesBrowse from '../sidebar-navigation-screen-templates-browse';

export const templateItemRoute = {
	name: 'template-item',
	path: '/wp_template/*postId',
	areas: {
		sidebar: <SidebarNavigationScreenTemplatesBrowse backPath="/" />,
		mobile: <Editor />,
		preview: <Editor />,
	},
};

export const staticTemplateItemRoute = {
	name: 'static-template-item',
	path: '/_wp_static_template/*postId',
	areas: {
		sidebar: <SidebarNavigationScreenTemplatesBrowse backPath="/" />,
		mobile: <Editor />,
		preview: <Editor />,
	},
};
