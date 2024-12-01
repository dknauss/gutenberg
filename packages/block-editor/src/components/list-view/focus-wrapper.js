/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { useEffect, useRef, useState, useCallback } from '@wordpress/element';

const FocusWrapper = ( {
	children,
	onFocusWithin,
	onBlurWithin,
	onKeyDown,
} ) => {
	const [ isFocused, setIsFocused ] = useState( false );
	const wrapperRef = useRef( null );
	const handleFocusIn = useCallback(
		( event ) => {
			if (
				wrapperRef.current &&
				wrapperRef.current.contains( event.target )
			) {
				setIsFocused( true );
				if ( onFocusWithin ) {
					onFocusWithin();
				}
			}
		},
		[ onFocusWithin ]
	);

	// @TODO this should only fire if the focus is leaving the wrapper
	// and there's no search activity going on (search control causes focus loss).
	const handleFocusOut = useCallback(
		( event ) => {
			if (
				wrapperRef.current &&
				! wrapperRef.current.contains( event.relatedTarget )
			) {
				setIsFocused( false );
				if ( onBlurWithin ) {
					onBlurWithin();
				}
			}
		},
		[ onBlurWithin ]
	);

	const handleKeyDown = useCallback(
		( event ) => {
			if ( isFocused && onKeyDown ) {
				onKeyDown( event );
			}
		},
		[ isFocused, onKeyDown ]
	);

	useEffect( () => {
		document.addEventListener( 'focusin', handleFocusIn );
		document.addEventListener( 'focusout', handleFocusOut );
		document.addEventListener( 'keydown', handleKeyDown );

		return () => {
			document.removeEventListener( 'focusin', handleFocusIn );
			document.removeEventListener( 'focusout', handleFocusOut );
			document.removeEventListener( 'keydown', handleKeyDown );
		};
	}, [ handleFocusIn, handleFocusOut, handleKeyDown ] );

	return (
		<div
			ref={ wrapperRef }
			className={ clsx( 'block-editor-list-view-tree__focus-wrapper', {
				'is-focused': isFocused,
			} ) }
		>
			{ children }
		</div>
	);
};

export default FocusWrapper;
