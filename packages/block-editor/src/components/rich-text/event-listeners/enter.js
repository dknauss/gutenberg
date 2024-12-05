/**
 * WordPress dependencies
 */
import { ENTER } from '@wordpress/keycodes';
import { insert, remove } from '@wordpress/rich-text';

export default ( props ) => ( element ) => {
	function onKeyDown( event ) {
		if ( event.keyCode !== ENTER ) {
			return;
		}

		const {
			onReplace,
			onSplit,
			supportsSplitting,
			disableLineBreaks,
			onChange,
			value,
			onSplitAtDoubleLineEnd,
			registry,
			onSplitAtEnd,
		} = props.current;
		const { text, start, end } = value;

		if ( event.shiftKey ) {
			if ( ! disableLineBreaks ) {
				event.preventDefault();
				onChange( insert( value, '\n' ) );
			}
		} else if ( onSplitAtEnd && start === end && end === text.length ) {
			// This is no longer used anywhere. Deprecate?
			event.preventDefault();
			onSplitAtEnd();
		} else if ( onReplace && onSplit ) {
			event.__deprecatedOnSplit = true;
		} else if (
			! supportsSplitting &&
			! disableLineBreaks &&
			! event.defaultPrevented
		) {
			event.preventDefault();
			if (
				// For some blocks it's desirable to split at the end of the
				// block when there are two line breaks at the end of the
				// block, so triple Enter exits the block.
				onSplitAtDoubleLineEnd &&
				start === end &&
				end === text.length &&
				text.slice( -2 ) === '\n\n'
			) {
				registry.batch( () => {
					const _value = { ...value };
					_value.start = _value.end - 2;
					onChange( remove( _value ) );
					onSplitAtDoubleLineEnd();
				} );
			} else {
				onChange( insert( value, '\n' ) );
			}
		}
	}

	function onDefaultKeyDown( event ) {
		if ( event.defaultPrevented ) {
			return;
		}

		// The event listener is attached to the window, so we need to check if
		// the target is the element.
		if ( event.target !== element ) {
			return;
		}

		if ( event.keyCode !== ENTER ) {
			return;
		}

		// On ENTER, we ALWAYS want to prevent the default browser behaviour
		// at this last interception point.
		event.preventDefault();
	}

	const { defaultView } = element.ownerDocument;

	// Attach the listener to the window so parent elements have the chance to
	// prevent the default behavior.
	defaultView.addEventListener( 'keydown', onDefaultKeyDown );
	element.addEventListener( 'keydown', onKeyDown );
	return () => {
		defaultView.removeEventListener( 'keydown', onDefaultKeyDown );
		element.removeEventListener( 'keydown', onKeyDown );
	};
};
