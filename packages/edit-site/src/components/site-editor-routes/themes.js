/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';

/**
 * Internal dependencies
 */
import SidebarNavigationScreenMain from '../sidebar-navigation-screen-main';
import Page from '../page';

const fields = [
	{
		id: 'theme_name',
		type: 'text',
		label: 'Theme name',
	},
];
const form = {
	type: 'regular',
	fields: [ 'theme_name' ],
};

export const themesRoute = {
	name: 'themes',
	path: '/themes',
	areas: {
		sidebar: <SidebarNavigationScreenMain />,
		content: (
			<Page title={ __( 'Create theme' ) }>
				<h1>Hello! This is a test.</h1>
				<form>
					<VStack spacing="5">
						<DataForm fields={ fields } form={ form } onChange="" />
						<HStack justify="right">
							<Button
								__next40pxDefaultSize
								variant="primary"
								type="submit"
							>
								{ __( 'Create' ) }
							</Button>
						</HStack>
					</VStack>
				</form>
			</Page>
		),
	},
};
