/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';
import { __experimentalGrid as Grid } from '@wordpress/components';
import { View } from '@wordpress/primitives';
import {
	BlockList,
	privateApis as blockEditorPrivateApis,
} from '@wordpress/block-editor';
import { __, _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';

const { ExperimentalBlockEditorProvider, useGlobalStyle } = unlock(
	blockEditorPrivateApis
);

const NAVIGATION_STATES = [
	{
		key: 'default',
		title: __( 'Navigation Item' ),
	},
	{
		key: ':active',
		title: __( 'Navigation Item (Active)' ),
	},
	{
		key: ':any-link',
		title: __( 'Navigation Item (Any Link)' ),
	},
	{
		key: ':focus',
		title: __( 'Navigation Item (Focus)' ),
	},
	{
		key: ':hover',
		title: __( 'Navigation Item (Hover)' ),
	},
	{
		key: ':link',
		title: __( 'Navigation Item (Link)' ),
	},
	{
		key: ':visited',
		title: __( 'Navigation Item (Visited)' ),
	},
];

function NavigationExamples() {
	const [ elementsLink ] = useGlobalStyle( 'elements.link' );

	const blocks = [
		...NAVIGATION_STATES.map( ( { key } ) => {
			const styles =
				( key !== 'default' ? elementsLink[ key ] : elementsLink ) ||
				{};
			return createBlock( 'core/navigation-link', {
				label: _x( 'About', 'navigation link preview example' ),
				url: 'https://example.com',
				style: styles,
			} );
		} ),
	];

	return (
		<Grid columns={ 2 } gap={ 6 }>
			{ blocks.map( ( block, index ) => (
				<View
					key={ `navigation-example-${ NAVIGATION_STATES[ index ].key }` }
				>
					<span className="edit-site-style-book__example-subtitle">
						{ NAVIGATION_STATES[ index ].title }
					</span>
					<ExperimentalBlockEditorProvider value={ [ block ] }>
						<BlockList appender={ false } />
					</ExperimentalBlockEditorProvider>
				</View>
			) ) }
		</Grid>
	);
}

export default NavigationExamples;
