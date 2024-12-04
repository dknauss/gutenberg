/**
 * WordPress dependencies
 */
import { sprintf, __, _n } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { copy } from '@wordpress/icons';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import BlockIcon from '../block-icon';
import { store as blockEditorStore } from '../../store';

export default function MultiSelectionInspector() {
	const { selectedBlockCount, isUsingBindings } = useSelect( ( select ) => {
		const {
			getSelectedBlockCount,
			getBlockAttributes,
			getSelectedBlockClientIds,
		} = select( blockEditorStore );

		return {
			selectedBlockCount: getSelectedBlockCount(),
			isUsingBindings: getSelectedBlockClientIds().every(
				( clientId ) =>
					!! getBlockAttributes( clientId )?.metadata?.bindings
			),
		};
	}, [] );

	return (
		<HStack
			justify="flex-start"
			align="flex-start"
			spacing={ 2 }
			className="block-editor-multi-selection-inspector__card"
		>
			<BlockIcon icon={ copy } showColors />
			<VStack spacing={ 1 }>
				<p className="block-editor-multi-selection-inspector__card-title">
					{ sprintf(
						/* translators: %d: number of blocks */
						_n( '%d Block', '%d Blocks', selectedBlockCount ),
						selectedBlockCount
					) }
				</p>
				{ isUsingBindings && (
					<Text
						as="p"
						className="block-editor-multi-selection-inspector__card-description"
					>
						{ __( 'These blocks are connected.' ) }
					</Text>
				) }
			</VStack>
		</HStack>
	);
}
