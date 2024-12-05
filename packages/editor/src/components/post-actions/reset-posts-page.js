/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import {
	Button,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Internal dependencies
 */
import { getItemTitle } from '../../utils';

const ResetPostsPageModal = ( { items, closeModal } ) => {
	const [ item ] = items;
	const pageTitle = getItemTitle( item );
	const { isPageOnFrontSet, isSaving } = useSelect( ( select ) => {
		const { getEntityRecord, isSavingEntityRecord } = select( coreStore );
		const siteSettings = getEntityRecord( 'root', 'site' );
		return {
			isPageOnFrontSet: siteSettings?.page_on_front !== 0,
			isSaving: isSavingEntityRecord( 'root', 'site' ),
		};
	} );

	const { saveEditedEntityRecord, saveEntityRecord } =
		useDispatch( coreStore );
	const { createSuccessNotice, createErrorNotice } =
		useDispatch( noticesStore );

	async function onResetPostsPage( event ) {
		event.preventDefault();

		try {
			// Save new posts page settings.
			await saveEditedEntityRecord( 'root', 'site', undefined, {
				page_for_posts: 0,
				show_on_front: isPageOnFrontSet ? 'page' : 'posts',
			} );

			// This second call to a save function is a workaround for a bug in
			// `saveEditedEntityRecord`. This forces the root site settings to be updated.
			// See https://github.com/WordPress/gutenberg/issues/67161.
			await saveEntityRecord( 'root', 'site', {
				page_for_posts: 0,
				show_on_front: isPageOnFrontSet ? 'page' : 'posts',
			} );

			createSuccessNotice( __( 'Posts page reset' ), {
				type: 'snackbar',
			} );
		} catch ( error ) {
			const typedError = error;
			const errorMessage =
				typedError.message && typedError.code !== 'unknown_error'
					? typedError.message
					: __( 'An error occurred while resetting the posts page' );
			createErrorNotice( errorMessage, { type: 'snackbar' } );
		} finally {
			closeModal?.();
		}
	}

	const modalWarning = ! isPageOnFrontSet
		? __( 'This will set the homepage to display latest posts.' )
		: '';

	const modalText = sprintf(
		// translators: %1$s: title of the page to be unset as the posts page, %2$s: post pages warning message.
		__(
			'Reset the posts page? "%1$s" will no longer be the posts page. %2$s'
		),
		pageTitle,
		modalWarning
	);

	// translators: Button label to confirm resetting the posts page.
	const modalButtonLabel = __( 'Reset posts page' );

	return (
		<form onSubmit={ onResetPostsPage }>
			<VStack spacing="5">
				<Text>{ modalText }</Text>
				<HStack justify="right">
					<Button
						__next40pxDefaultSize
						variant="tertiary"
						onClick={ () => {
							closeModal?.();
						} }
						disabled={ isSaving }
						accessibleWhenDisabled
					>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="primary"
						type="submit"
						disabled={ isSaving }
						accessibleWhenDisabled
					>
						{ modalButtonLabel }
					</Button>
				</HStack>
			</VStack>
		</form>
	);
};

export const useResetPostsPageAction = () => {
	const { pageForPosts } = useSelect( ( select ) => {
		const { getEntityRecord } = select( coreStore );
		const siteSettings = getEntityRecord( 'root', 'site' );
		return {
			pageForPosts: siteSettings?.page_for_posts,
		};
	} );

	return useMemo(
		() => ( {
			id: 'reset-posts-page',
			label: __( 'Reset posts page' ),
			isEligible( post ) {
				if ( pageForPosts !== post.id ) {
					return false;
				}

				return true;
			},
			RenderModal: ResetPostsPageModal,
		} ),
		[ pageForPosts ]
	);
};
