/**
 * WordPress dependencies
 */
import { privateApis as routerPrivateApis } from '@wordpress/router';

/**
 * Internal dependencies
 */
import Editor from '../editor';
import { unlock } from '../../lock-unlock';
import SidebarNavigationScreenPatterns from '../sidebar-navigation-screen-patterns';
import PagePatterns from '../page-patterns';

const { useLocation } = unlock( routerPrivateApis );

function MobilePatternsView() {
	const { query = {} } = useLocation();
	const { canvas = 'view', postType, categoryId } = query;

	if ( canvas === 'edit' ) {
		return <Editor />;
	}

	if (
		( postType === 'wp_block' || postType === 'wp_template_part' ) &&
		!! categoryId
	) {
		return <PagePatterns />;
	}

	return <SidebarNavigationScreenPatterns backPath="/" />;
}

export const patternsRoute = {
	name: 'patterns',
	path: '/pattern',
	areas: {
		sidebar: <SidebarNavigationScreenPatterns backPath="/" />,
		content: <PagePatterns />,
		mobile: <MobilePatternsView />,
	},
};
