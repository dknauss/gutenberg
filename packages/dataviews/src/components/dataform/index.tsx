/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type { DataFormProps } from '../../types';
import { DataFormProvider } from '../dataform-context';
import { normalizeFields } from '../../normalize-fields';
import { DataFormLayout } from '../../dataforms-layouts/data-form-layout';

/**
 * Loops through the list of data items and returns an object with the intersecting ( same ) key and values.
 *
 * @param data list of items.
 */
function getIntersectingValues< Item extends object >( data: Item[] ): Item {
	const intersectingValues = {} as Item;
	const keys = Object.keys( data[ 0 ] ) as Array< keyof Item >;
	for ( const key of keys ) {
		const [ firstRecord, ...remainingRecords ] = data;
		const intersects = remainingRecords.every( ( item ) => {
			return item[ key ] === firstRecord[ key ];
		} );
		if ( intersects ) {
			intersectingValues[ key ] = firstRecord[ key ];
		}
	}
	return intersectingValues;
}

export default function DataForm< Item extends object >( {
	data,
	form,
	fields,
	onChange,
}: DataFormProps< Item > ) {
	const normalizedFields = useMemo(
		() => normalizeFields( fields ),
		[ fields ]
	);

	const flattenedData = useMemo( () => {
		if ( Array.isArray( data ) ) {
			return getIntersectingValues< Item >( data );
		}
		return data;
	}, [ data ] );

	if ( ! form.fields ) {
		return null;
	}

	const isBulkEditing = Array.isArray( data );

	return (
		<DataFormProvider fields={ normalizedFields }>
			<DataFormLayout
				data={ flattenedData }
				form={ form }
				onChange={ onChange }
				isBulkEditing={ isBulkEditing }
			/>
		</DataFormProvider>
	);
}
