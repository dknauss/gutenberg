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
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';

const { ExperimentalBlockEditorProvider, useGlobalStyle } = unlock(
	blockEditorPrivateApis
);

const BUTTON_STATE_NAMES = [
	'default',
	':active',
	':any-link',
	':focus',
	':hover',
	':link',
	':visited',
];

function ButtonExamples() {
	const [ elementsButton ] = useGlobalStyle( 'elements.button' );
	const blocks = BUTTON_STATE_NAMES.map( ( state ) => {
		const styles =
			( state !== 'default'
				? elementsButton[ state ]
				: elementsButton ) || {};
		return createBlock( 'core/button', {
			text: __( 'Call to Action' ),
			style: styles,
		} );
	} );

	return (
		<Grid columns={ 2 } gap={ 6 }>
			{ blocks.map( ( block, key ) => (
				<View key={ `button-example-${ key }` }>
					<ExperimentalBlockEditorProvider value={ [ block ] }>
						<BlockList appender={ false } />
					</ExperimentalBlockEditorProvider>

					<span className="edit-site-style-book__example-subtitle">
						{ BUTTON_STATE_NAMES[ key ] }
					</span>
				</View>
			) ) }
		</Grid>
	);
}

export default ButtonExamples;
