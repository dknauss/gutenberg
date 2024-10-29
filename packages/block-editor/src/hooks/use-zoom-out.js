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

	const toggleZoomOnUnmount = useRef( false );
	const userZoomState = useRef( null );
	const isZoomedOut = isZoomOut();

	useEffect( () => {
		// Store the user's manually set zoom state on mount.
		userZoomState.current = isZoomOut();

		return () => {
			if ( ! toggleZoomOnUnmount.current ) {
				return;
			}

			if ( isZoomOut() ) {
				resetZoomLevel();
			} else {
				setZoomLevel( 'auto-scaled' );
			}
		};
	}, [] );

	/**
	 * This hook should only run when the requested zoomOut changes. We don't want to
	 * update it when isZoomedOut changes.
	 */
	useEffect( () => {
		// Requested zoom and current zoom states are different, so toggle the state.
		if ( zoomOut !== isZoomedOut ) {
			// If the requested zoomOut matches the user's manually set zoom state,
			// do not toggle the zoom level on unmount.
			if ( userZoomState.current === zoomOut ) {
				toggleZoomOnUnmount.current = false;
			} else {
				toggleZoomOnUnmount.current = true;
			}

			if ( isZoomedOut ) {
				resetZoomLevel();
			} else {
				setZoomLevel( 'auto-scaled' );
			}
		}
		// Intentionally excluding isZoomedOut so this hook will not recursively udpate.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ zoomOut, setZoomLevel, resetZoomLevel ] );

	/**
	 * This hook tracks if the zoom state was changed manually by the user via clicking
	 * the zoom out button.
	 */
	useEffect( () => {
		// If the zoom state changed (isZoomOut) and it does not match the requested zoom
		// state (zoomOut), then it means the user manually changed the zoom state and we should
		// not toggle the zoom level on unmount.
		if ( isZoomedOut !== zoomOut ) {
			toggleZoomOnUnmount.current = false;
			userZoomState.current = zoomOut;
		}

		// Intentionally excluding zoomOut from the dependency array. We want to catch instances where
		// the zoom out state changes due to user interaction and not due to the hook.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ isZoomedOut ] );
}
