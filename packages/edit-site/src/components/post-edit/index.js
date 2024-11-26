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

const { PostCardPanel, usePostFields } = unlock( editorPrivateApis );

const fieldsWithBulkEditSupport = [
	'title',
	'status',
	'date',
	'author',
	'comment_status',
];

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

	const form = useMemo(
		() => ( {
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
			].filter(
				( field ) =>
					ids.length === 1 ||
					fieldsWithBulkEditSupport.includes(
						typeof field === 'string' ? field : field.id
					)
			),
		} ),
		[ ids ]
	);
	const onChange = ( edits ) => {
		for ( const id of ids ) {
			if (
				edits.status &&
				edits.status !== 'future' &&
				record?.status === 'future' &&
				new Date( record.date ) > new Date()
			) {
				edits.date = null;
			}
			if (
				edits.status &&
				edits.status === 'private' &&
				record.password
			) {
				edits.password = '';
			}
			editEntityRecord( 'postType', postType, id, edits );
		}
	};

	return (
		<VStack spacing={ 4 }>
			{ ids.length === 1 && (
				<PostCardPanel postType={ postType } postId={ ids[ 0 ] } />
			) }
			<DataForm
				data={ ids.length === 1 ? record : records }
				fields={ fields }
				form={ form }
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
