/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../store';
import { unlock } from '../lock-unlock';

/**
 * A hook used to set the editor mode to zoomed out mode, invoking the hook sets the mode.
 *
 * @param {boolean} zoomOut If we should enter into zoomOut mode or not
 */
export function useZoomOut( zoomOut = true ) {
	const { setZoomLevel, resetZoomLevel } = unlock(
		useDispatch( blockEditorStore )
	);
	const { isZoomOut } = unlock( useSelect( blockEditorStore ) );

	const programmaticZoomOutChange = useRef( null );

	const toggleZoomOut = ( isZoomedOut ) => {
		if ( isZoomedOut ) {
			resetZoomLevel();
		} else {
			setZoomLevel( 'auto-scaled' );
		}
	};

	useEffect( () => {
		const matchedZoomOutStateOnMount = zoomOut === isZoomOut();

		return () => {
			const isZoomedOut = isZoomOut();
			// If the zoomOut state matched on mount and the current zoom state
			// matches on unmount, then no action is needed.
			if ( matchedZoomOutStateOnMount && isZoomedOut === zoomOut ) {
				return;
			}

			// The modes matched during a hook rerender (zoomOut === isZoomOut()),
			// so we should not invert zoom states. This catches manual zoom out
			// changes while the hook was mounted.
			if ( ! programmaticZoomOutChange.current ) {
				return;
			}

			// Zoom Out mode was changed by this hook, so we need to invert the state.
			toggleZoomOut( isZoomedOut );
		};
	}, [] );

	useEffect( () => {
		const isZoomedOut = isZoomOut();

		// Requested zoom and current zoom states are different, so toggle the state.
		if ( zoomOut !== isZoomedOut ) {
			programmaticZoomOutChange.current = true;

			toggleZoomOut( isZoomedOut );
		} else {
			// Reset the flag if the zoom state is the same as requested.
			programmaticZoomOutChange.current = false;
		}
	}, [ zoomOut, isZoomOut, toggleZoomOut ] );
}
