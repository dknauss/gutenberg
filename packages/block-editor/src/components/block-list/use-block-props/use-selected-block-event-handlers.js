/**
 * WordPress dependencies
 */
import { isTextField } from '@wordpress/dom';
import { ENTER, BACKSPACE, DELETE } from '@wordpress/keycodes';
import { useSelect, useDispatch } from '@wordpress/data';
import { useRefEffect } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../../store';
import { unlock } from '../../../lock-unlock';

/**
 * Adds block behaviour:
 *   - Removes the block on BACKSPACE.
 *   - Inserts a default block on ENTER.
 *   - Disables dragging of block contents.
 *
 * @param {string} clientId Block client ID.
 */
export function useEventHandlers( { clientId, isSelected } ) {
	const { getBlockRootClientId, isZoomOut, hasMultiSelection } = unlock(
		useSelect( blockEditorStore )
	);
	const {
		insertAfterBlock,
		removeBlock,
		resetZoomLevel,
		startDraggingBlocks,
		stopDraggingBlocks,
	} = unlock( useDispatch( blockEditorStore ) );

	return useRefEffect(
		( node ) => {
			if ( ! isSelected ) {
				return;
			}

			/**
			 * Interprets keydown event intent to remove or insert after block if
			 * key event occurs on wrapper node. This can occur when the block has
			 * no text fields of its own, particularly after initial insertion, to
			 * allow for easy deletion and continuous writing flow to add additional
			 * content.
			 *
			 * @param {KeyboardEvent} event Keydown event.
			 */
			function onKeyDown( event ) {
				const { keyCode, target } = event;

				if (
					keyCode !== ENTER &&
					keyCode !== BACKSPACE &&
					keyCode !== DELETE
				) {
					return;
				}

				if ( target !== node || isTextField( target ) ) {
					return;
				}

				event.preventDefault();

				if ( keyCode === ENTER && isZoomOut() ) {
					resetZoomLevel();
				} else if ( keyCode === ENTER ) {
					insertAfterBlock( clientId );
				} else {
					removeBlock( clientId );
				}
			}

			/**
			 * Prevents default dragging behavior within a block. To do: we must
			 * handle this in the future and clean up the drag target.
			 *
			 * @param {DragEvent} event Drag event.
			 */
			function onDragStart( event ) {
				if (
					node !== event.target ||
					node.isContentEditable ||
					node.ownerDocument.activeElement !== node ||
					hasMultiSelection()
				) {
					event.preventDefault();
					return;
				}
				const data = JSON.stringify( {
					type: 'block',
					srcClientIds: [ clientId ],
					srcRootClientId: getBlockRootClientId( clientId ),
				} );
				event.dataTransfer.effectAllowed = 'move'; // remove "+" cursor
				event.dataTransfer.clearData();
				event.dataTransfer.setData( 'wp-blocks', data );
				const { ownerDocument } = node;
				const { defaultView } = ownerDocument;
				const selection = defaultView.getSelection();
				selection.removeAllRanges();

				// Setting the drag chip as the drag image actually works, but
				// the behaviour is slightly different in every browser. In
				// Safari, it animates, in Firefox it's slightly transparent...
				// So we set a fake drag image and have to reposition it
				// ourselves.
				const dragElement = ownerDocument.createElement( 'div' );
				// Chrome will show a globe icon if the drag element does not
				// have dimensions.
				dragElement.style.width = '1px';
				dragElement.style.height = '1px';
				dragElement.style.position = 'fixed';
				dragElement.style.visibility = 'hidden';
				ownerDocument.body.appendChild( dragElement );
				event.dataTransfer.setDragImage( dragElement, 0, 0 );

				const rect = node.getBoundingClientRect();

				node.style.transition = 'transform 0.3s ease-out';
				node.style.zIndex = '1000';

				setTimeout( () => {
					node.style.transition = 'none';
				}, 300 );

				const initialScrollX = defaultView.pageXOffset;
				const initialScrollY = defaultView.pageYOffset;

				function over( e ) {
					node.style.transform = `translate( ${
						10 +
						e.clientX -
						rect.left +
						defaultView.pageXOffset -
						initialScrollX
					}px, ${
						10 +
						e.clientY -
						rect.top +
						defaultView.pageYOffset -
						initialScrollY
					}px ) scale( 0.5 )`;
					node.style.transformOrigin = '0 0';
				}

				function end() {
					ownerDocument.removeEventListener( 'dragover', over );
					ownerDocument.removeEventListener( 'dragend', end );
					node.style.transform = '';
					node.style.transition = '';
					node.style.zIndex = '';
					dragElement.remove();
					stopDraggingBlocks();
					document.body.classList.remove(
						'is-dragging-components-draggable'
					);
					ownerDocument.documentElement.classList.remove(
						'is-dragging'
					);
					ownerDocument.removeEventListener( 'scroll', over );
				}

				ownerDocument.addEventListener( 'dragover', over );
				ownerDocument.addEventListener( 'dragend', end );
				ownerDocument.addEventListener( 'drop', end );
				ownerDocument.addEventListener( 'scroll', over );

				startDraggingBlocks( [ clientId ] );
				// Important because it hides the block toolbar.
				document.body.classList.add(
					'is-dragging-components-draggable'
				);
				ownerDocument.documentElement.classList.add( 'is-dragging' );
			}

			node.addEventListener( 'keydown', onKeyDown );
			node.addEventListener( 'dragstart', onDragStart );

			return () => {
				node.removeEventListener( 'keydown', onKeyDown );
				node.removeEventListener( 'dragstart', onDragStart );
			};
		},
		[
			clientId,
			isSelected,
			getBlockRootClientId,
			insertAfterBlock,
			removeBlock,
			isZoomOut,
			resetZoomLevel,
			hasMultiSelection,
			startDraggingBlocks,
			stopDraggingBlocks,
		]
	);
}
