/**
 * WordPress dependencies
 */
import {
	Modal,
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	ToggleControl,
} from '@wordpress/components';
import { __, _x } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { store as coreStore } from '@wordpress/core-data';
import { DataForm, useValidation } from '@wordpress/dataviews';

/**
 * Internal dependencies
 */
import {
	PATTERN_DEFAULT_CATEGORY,
	PATTERN_SYNC_TYPES,
	PATTERN_TYPES,
} from '../constants';
import { store as patternsStore } from '../store';
import CategorySelector from './category-selector';
import { useAddPatternCategory } from '../private-hooks';
import { unlock } from '../lock-unlock';

export default function CreatePatternModal( {
	className = 'patterns-menu-items__convert-modal',
	modalTitle,
	...restProps
} ) {
	const defaultModalTitle = useSelect(
		( select ) =>
			select( coreStore ).getPostType( PATTERN_TYPES.user )?.labels
				?.add_new_item,
		[]
	);
	return (
		<Modal
			title={ modalTitle || defaultModalTitle }
			onRequestClose={ restProps.onClose }
			overlayClassName={ className }
			focusOnMount="firstContentElement"
			size="small"
		>
			<CreatePatternModalContents { ...restProps } />
		</Modal>
	);
}

export function CreatePatternModalContents( {
	confirmLabel = __( 'Add' ),
	defaultCategories = [],
	content,
	onClose,
	onError,
	onSuccess,
	defaultSyncType = PATTERN_SYNC_TYPES.full,
	defaultTitle = '',
} ) {
	const [ pattern, setPattern ] = useState( {
		title: defaultTitle,
		categoryTerms: defaultCategories,
		sync: defaultSyncType,
	} );

	const [ isSaving, setIsSaving ] = useState( false );
	const { createPattern } = unlock( useDispatch( patternsStore ) );
	const { createErrorNotice } = useDispatch( noticesStore );

	const { categoryMap, findOrCreateTerm } = useAddPatternCategory();

	const validation = useValidation();

	const fields = [
		{
			id: 'title',
			label: __( 'Name' ),
			type: 'text',
			validationSchema: {
				minLength: 1,
				maxLength: 10,
				onTouched: true,
			},
		},
		{
			id: 'categoryTerms',
			label: __( 'Categories' ),
			Edit: ( { field, data, onChange } ) => {
				const { id } = field;
				const categoryTerms = field.getValue( { item: data } );
				return (
					<CategorySelector
						categoryTerms={ categoryTerms }
						onChange={ ( newValue ) => {
							onChange( {
								[ id ]: newValue,
							} );
						} }
						categoryMap={ categoryMap }
					/>
				);
			},
		},
		{
			id: 'sync',
			label: __( 'Synced' ),
			Edit: ( { field, data, onChange } ) => {
				const { id } = field;
				const sync = field.getValue( { item: data } );
				return (
					<ToggleControl
						__nextHasNoMarginBottom
						label={ _x( 'Synced', 'pattern (singular)' ) }
						help={ __(
							'Sync this pattern across multiple locations.'
						) }
						checked={ sync === PATTERN_SYNC_TYPES.full }
						onChange={ () => {
							onChange( {
								[ id ]:
									sync === PATTERN_SYNC_TYPES.full
										? PATTERN_SYNC_TYPES.unsynced
										: PATTERN_SYNC_TYPES.full,
							} );
						} }
					/>
				);
			},
		},
	];

	const form = {
		fields: [ 'title', 'categoryTerms', 'sync' ],
	};

	async function onCreate( patternTitle, sync ) {
		if ( ! validation.isFormValid || isSaving ) {
			return;
		}

		try {
			setIsSaving( true );
			const categories = await Promise.all(
				pattern.categoryTerms.map( ( termName ) =>
					findOrCreateTerm( termName )
				)
			);

			const newPattern = await createPattern(
				patternTitle,
				sync,
				typeof content === 'function' ? content() : content,
				categories
			);
			onSuccess( {
				pattern: newPattern,
				categoryId: PATTERN_DEFAULT_CATEGORY,
			} );
		} catch ( error ) {
			createErrorNotice( error.message, {
				type: 'snackbar',
				id: 'pattern-create',
			} );
			onError?.();
		} finally {
			setIsSaving( false );
		}
	}

	return (
		<VStack spacing="5">
			<DataForm
				data={ pattern }
				validation={ validation }
				fields={ fields }
				form={ form }
				onChange={ ( newData ) => {
					setPattern( {
						...pattern,
						...newData,
					} );
				} }
			/>
			<HStack justify="right">
				<Button
					__next40pxDefaultSize
					variant="tertiary"
					onClick={ () => {
						onClose();
					} }
				>
					{ __( 'Cancel' ) }
				</Button>

				<Button
					__next40pxDefaultSize
					variant="primary"
					type="submit"
					aria-disabled={ ! validation.isFormValid() }
					onClick={ async () => {
						await onCreate( pattern.title, pattern.sync );
					} }
					isBusy={ isSaving }
				>
					{ confirmLabel }
				</Button>
			</HStack>
		</VStack>
	);
}
