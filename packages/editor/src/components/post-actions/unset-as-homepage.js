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

const UnsetAsHomepageModal = ( { items, closeModal } ) => {
	const [ item ] = items;
	const pageTitle = getItemTitle( item );
	const { isPageForPostsSet, currentHomePage, isSaving } = useSelect(
		( select ) => {
			const { getEntityRecord, isSavingEntityRecord } =
				select( coreStore );
			const siteSettings = getEntityRecord( 'root', 'site' );
			const currentHomePageItem = getEntityRecord(
				'postType',
				'page',
				siteSettings?.page_on_front
			);
			return {
				isPageForPostsSet: siteSettings?.page_for_posts !== 0,
				currentHomePage: currentHomePageItem,
				isSaving: isSavingEntityRecord( 'root', 'site' ),
			};
		}
	);
	const currentHomePageTitle = currentHomePage
		? getItemTitle( currentHomePage )
		: '';

	const { saveEditedEntityRecord, saveEntityRecord } =
		useDispatch( coreStore );
	const { createSuccessNotice, createErrorNotice } =
		useDispatch( noticesStore );

	async function onUnsetPageAsHomepage( event ) {
		event.preventDefault();

		try {
			// Save new home page settings.
			await saveEditedEntityRecord( 'root', 'site', undefined, {
				page_on_front: 0,
				show_on_front: isPageForPostsSet ? 'page' : 'posts',
			} );

			// This second call to a save function is a workaround for a bug in
			// `saveEditedEntityRecord`. This forces the root site settings to be updated.
			// See https://github.com/WordPress/gutenberg/issues/67161.
			await saveEntityRecord( 'root', 'site', {
				page_on_front: 0,
				show_on_front: isPageForPostsSet ? 'page' : 'posts',
			} );

			createSuccessNotice( __( 'Homepage unset' ), {
				type: 'snackbar',
			} );
		} catch ( error ) {
			const typedError = error;
			const errorMessage =
				typedError.message && typedError.code !== 'unknown_error'
					? typedError.message
					: __( 'An error occurred while unsetting the homepage' );
			createErrorNotice( errorMessage, { type: 'snackbar' } );
		} finally {
			closeModal?.();
		}
	}

	const modalWarning = ! isPageForPostsSet
		? __( 'This will set the homepage to display latest posts.' )
		: sprintf(
				// translators: %s: title of the current home page.
				__( 'This will replace the current homepage: "%s"' ),
				currentHomePageTitle
		  );

	const modalText = sprintf(
		// translators: %1$s: title of the page to be unset as the homepage, %2$s: homepage replacement warning message.
		__( 'Unset "%1$s" as the site homepage? %2$s' ),
		pageTitle,
		modalWarning
	);

	// translators: Button label to confirm unsetting the specified page as the homepage.
	const modalButtonLabel = __( 'Unset as homepage' );

	return (
		<form onSubmit={ onUnsetPageAsHomepage }>
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

export const useUnsetAsHomepageAction = () => {
	const { pageOnFront } = useSelect( ( select ) => {
		const { getEntityRecord } = select( coreStore );
		const siteSettings = getEntityRecord( 'root', 'site' );
		return {
			pageOnFront: siteSettings?.page_on_front,
		};
	} );

	return useMemo(
		() => ( {
			id: 'unset-as-homepage',
			label: __( 'Unset as homepage' ),
			isEligible( post ) {
				if ( pageOnFront !== post.id ) {
					return false;
				}

				return true;
			},
			RenderModal: UnsetAsHomepageModal,
		} ),
		[ pageOnFront ]
	);
};
