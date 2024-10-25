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

	const toggleZoomOnUnmount = useRef( null );

	// Let this hook know if the zoom state was changed manually.
	const manualIsZoomOutCheck = isZoomOut();

	useEffect( () => {
		// If the zoom state changed (isZoomOut) and it does not match the requested zoom
		// state (zoomOut), then it means they manually changed the zoom state and we should
		// not toggle the zoom level on unmount.
		if ( manualIsZoomOutCheck !== zoomOut ) {
			toggleZoomOnUnmount.current = false;
		}
	}, [ manualIsZoomOutCheck ] );
	// Intentionally excluding zoomOut from the dependency array. We want to catch instances where
	// the zoom out state changes due to user interaction and not due to the hook.

	useEffect( () => {
		return () => {
			if ( ! toggleZoomOnUnmount.current ) {
				return;
			}

			// Zoom Out mode was toggled by this hook, so we need to invert the state.
			if ( isZoomOut() ) {
				resetZoomLevel();
			} else {
				setZoomLevel( 'auto-scaled' );
			}
		};
	}, [] );

	useEffect( () => {
		const isZoomedOut = isZoomOut();

		// Requested zoom and current zoom states are different, so toggle the state.
		if ( zoomOut !== isZoomedOut ) {
			toggleZoomOnUnmount.current = true;

			if ( isZoomedOut ) {
				resetZoomLevel();
			} else {
				setZoomLevel( 'auto-scaled' );
			}
		}
	}, [ zoomOut, setZoomLevel, isZoomOut, resetZoomLevel ] );
}
