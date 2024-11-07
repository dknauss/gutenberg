/**
 * WordPress dependencies
 */
import { useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as preferencesStore } from '@wordpress/preferences';
import { store as interfaceStore } from '@wordpress/interface';

/**
 * Internal dependencies
 */
import { store as editorStore } from '../../store';

export default function StartPageOptions() {
	const shouldEnable = useSelect( ( select ) => {
		const { isEditedPostDirty, isEditedPostEmpty, getCurrentPostType } =
			select( editorStore );
		const preferencesModalActive =
			select( interfaceStore ).isModalActive( 'editor/preferences' );
		const choosePatternModalEnabled = select( preferencesStore ).get(
			'core',
			'enableChoosePatternModal'
		);
		return (
			choosePatternModalEnabled &&
			! preferencesModalActive &&
			! isEditedPostDirty() &&
			isEditedPostEmpty() &&
			'page' === getCurrentPostType()
		);
	}, [] );
	const { setIsInserterOpened } = useDispatch( editorStore );

	useEffect( () => {
		if ( shouldEnable ) {
			setIsInserterOpened( {
				tab: 'patterns',
				category: 'core/starter-content',
			} );
		}
	}, [ shouldEnable, setIsInserterOpened ] );

	return null;
}
