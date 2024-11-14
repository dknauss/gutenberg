/**
 * Internal dependencies
 */
import type * as ET from './entity-types';

type DeleteRecordsHttpQuery = Record< string, any >;

type SaveRecordOptions = {
	throwOnError?: boolean;
};

type DeleteRecordOptions = {
	throwOnError?: boolean;
};

/**
 * Save the site settings
 *
 * @param data    The site settings
 * @param options
 */
export declare function saveSite(
	data: Partial< ET.Settings >,
	options?: SaveRecordOptions
): Promise< void >;

/**
 * Save comment
 *
 * @param data    The comment data
 * @param options
 */
export declare function saveComment(
	data: { id: number } & Partial< ET.Comment >,
	options?: SaveRecordOptions
): Promise< void >;

/**
 * Save media item
 *
 * @param data    The media item
 * @param options
 */
export declare function saveMedia(
	data: { id: number } & Partial< ET.Attachment >,
	options?: SaveRecordOptions
): Promise< void >;

/**
 * Save user
 *
 * @param data    The user data
 * @param options
 */
export declare function saveUser(
	data: { id: number } & Partial< ET.User >,
	options?: SaveRecordOptions
): Promise< void >;

/**
 * Delete a comment
 *
 * @param id      The comment ID
 * @param query   Special query parameters for the DELETE API call
 * @param options Delete options
 */
export declare function deleteComment(
	id: number,
	query?: DeleteRecordsHttpQuery,
	options?: DeleteRecordOptions
): Promise< void >;

/**
 * Delete a media item
 *
 * @param id      The media item ID
 * @param query   Special query parameters for the DELETE API call
 * @param options Delete options
 */
export declare function deleteMedia(
	id: number,
	query?: DeleteRecordsHttpQuery,
	options?: DeleteRecordOptions
): Promise< void >;

/**
 * Delete a user
 *
 * @param id      The user ID
 * @param query   Special query parameters for the DELETE API call
 * @param options Delete options
 */
export declare function deleteUser(
	id: number,
	query?: DeleteRecordsHttpQuery,
	options?: DeleteRecordOptions
): Promise< void >;
