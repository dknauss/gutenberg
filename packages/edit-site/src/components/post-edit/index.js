/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { DataForm } from '@wordpress/dataviews';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as coreDataStore } from '@wordpress/core-data';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useMemo } from '@wordpress/element';
import { privateApis as editorPrivateApis } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import Page from '../page';
import { unlock } from '../../lock-unlock';
import usePatternSettings from '../page-patterns/use-pattern-settings';
import { privateApis as blockEditorPrivateApis } from '@wordpress/block-editor';

const { PostCardPanel, usePostFields } = unlock( editorPrivateApis );

const DATAFORM_CONFIG = {
	type: 'panel',
	fields: [
		{
			id: 'featured_media',
			layout: 'regular',
		},
		'title',
		{
			id: 'status',
			label: __( 'Status & Visibility' ),
			children: [ 'status', 'password' ],
		},
		'author',
		'date',
		'slug',
		'parent',
		'comment_status',
		{
			label: __( 'Template' ),
			labelPosition: 'side',
			id: 'template',
			layout: 'regular',
		},
	],
};

function PostEditForm( { postType, postId } ) {
	const ids = useMemo( () => postId.split( ',' ), [ postId ] );
	const { record, records } = useSelect(
		( select ) => {
			return {
				record:
					ids.length === 1
						? select( coreDataStore ).getEditedEntityRecord(
								'postType',
								postType,
								ids[ 0 ]
						  )
						: null,
				records:
					ids.length > 1
						? ids.map( ( id ) =>
								select( coreDataStore ).getEditedEntityRecord(
									'postType',
									postType,
									id
								)
						  )
						: null,
			};
		},
		[ postType, ids ]
	);
	const { editEntityRecord } = useDispatch( coreDataStore );
	const { fields: _fields } = usePostFields( { postType } );
	const fields = useMemo(
		() =>
			_fields?.map( ( field ) => {
				if ( field.id === 'status' ) {
					return {
						...field,
						elements: field.elements.filter(
							( element ) => element.value !== 'trash'
						),
					};
				}
				return field;
			} ),
		[ _fields ]
	);

	const onChange = ( edits ) => {
		for ( const id of ids ) {
			const editedRecord =
				ids.length > 1 ? records.find( ( r ) => r.id === +id ) : record;
			if (
				edits.status &&
				edits.status !== 'future' &&
				editedRecord?.status === 'future' &&
				new Date( record.date ) > new Date()
			) {
				edits.date = null;
			}
			if (
				edits.status &&
				edits.status === 'private' &&
				editedRecord.password
			) {
				edits.password = '';
			}
			editEntityRecord( 'postType', postType, id, edits );
		}
	};

	const { ExperimentalBlockEditorProvider } = unlock(
		blockEditorPrivateApis
	);
	const settings = usePatternSettings();

	/**
	 * The template field depends on the block editor settings.
	 * This is a workaround to ensure that the block editor settings are available.
	 * For more information, see: https://github.com/WordPress/gutenberg/issues/67521
	 */
	const fieldsWithDependency = useMemo( () => {
		return fields.map( ( field ) => {
			if ( field.id === 'template' ) {
				return {
					...field,
					Edit: ( data ) => (
						<ExperimentalBlockEditorProvider settings={ settings }>
							<field.Edit { ...data } />
						</ExperimentalBlockEditorProvider>
					),
				};
			}
			return field;
		} );
	}, [ fields, settings ] );

	return (
		<VStack spacing={ 4 }>
			{ ids.length === 1 && (
				<PostCardPanel postType={ postType } postId={ ids[ 0 ] } />
			) }
			<DataForm
				data={ ids.length === 1 ? record : records }
				fields={ fieldsWithDependency }
				form={ DATAFORM_CONFIG }
				onChange={ onChange }
			/>
		</VStack>
	);
}

export function PostEdit( { postType, postId } ) {
	return (
		<Page
			className={ clsx( 'edit-site-post-edit', {
				'is-empty': ! postId,
			} ) }
			label={ __( 'Post Edit' ) }
		>
			{ postId && (
				<PostEditForm postType={ postType } postId={ postId } />
			) }
			{ ! postId && <p>{ __( 'Select a page to edit' ) }</p> }
		</Page>
	);
}
