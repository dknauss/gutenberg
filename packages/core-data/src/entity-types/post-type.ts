/**
 * Internal dependencies
 */
import type { Context, OmitNevers } from './helpers';
import type { BaseEntityRecords as _BaseEntityRecords } from './base-entity-records';

declare module './base-entity-records' {
	export namespace BaseEntityRecords {
		/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
		export interface PostType< C extends Context > {
			/**
			 * All capabilities used by the post type.
			 */
			capabilities: Record< string, string >;

			/**
			 * A human-readable description of the post type.
			 */
			description: string;

			/**
			 * Whether or not the post type should have children.
			 */
			hierarchical: boolean;

			/**
			 * If the value is a string, the value will be used as the archive slug. If the value is false the post type has no archive.
			 */
			has_archive: string | boolean;

			/**
			 * The visibility settings for the post type.
			 */
			visibility: {
				/**
				 * Whether to generate a default UI for managing this post type.
				 */
				show_ui: boolean;

				/**
				 * Whether to make the post type available for selection in navigation menus.
				 */
				show_in_nav_menus: boolean;
			};

			/**
			 * Whether or not the post type can be viewed.
			 */
			viewable: boolean;

			/**
			 * Human-readable labels for the post type for various contexts.
			 */
			labels: Record< string, string >;

			/**
			 * The title for the post type.
			 */
			name: string;

			/**
			 * An alphanumeric identifier for the post type.
			 */
			slug: string;

			/**
			 * The icon for the post type.
			 */
			icon: string | null;

			/**
			 * All features, supported by the post type.
			 */
			supports: Record< string, boolean >;

			/**
			 * Taxonomies associated with post type.
			 */
			taxonomies: Array< string >;

			/**
			 * REST base route for the post type.
			 */
			rest_base: string;

			/**
			 * REST route's namespace for the post type.
			 */
			rest_namespace: string;

			/**
			 * The block template associated with the post type.
			 */
			template: Array< object >;

			/**
			 * The template_lock associated with the post type, or false if none.
			 */
			template_lock: string | boolean;
		}
	}
}

export type PostType< C extends Context = 'edit' > = OmitNevers<
	_BaseEntityRecords.PostType< C >
>;
