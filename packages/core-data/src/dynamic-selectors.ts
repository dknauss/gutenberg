/**
 * Internal dependencies
 */
import type { GetRecordsHttpQuery, State } from './selectors';
import type * as ET from './entity-types';

export namespace DynamicSelectors {
	type Nullable< T > = T | null;

	/**
	 * Get post type object by name.
	 *
	 * @param state Data state.
	 * @param name  Post type name.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getPostType(
		state: State,
		name: string,
		query?: GetRecordsHttpQuery
	): ET.PostType | undefined;

	/**
	 * Get the list of post type objects.
	 *
	 * @param state Data state.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getPostTypes(
		state: State,
		query?: GetRecordsHttpQuery
	): Nullable< Array< ET.PostType > >;

	/**
	 * Get media item by ID.
	 *
	 * @param state Data state.
	 * @param id    Media item ID.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getMedia(
		state: State,
		id: number,
		query?: GetRecordsHttpQuery
	): ET.Attachment | undefined;

	/**
	 * Get the media items list.
	 *
	 * @param state Data state.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getMediaItems(
		state: State,
		query?: GetRecordsHttpQuery
	): Nullable< Array< ET.Attachment > >;

	/**
	 * Get taxonomy object by name.
	 *
	 * @param state Data state.
	 * @param name  Taxonomy name.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getTaxonomy(
		state: State,
		name: string,
		query?: GetRecordsHttpQuery
	): ET.Taxonomy | undefined;

	/**
	 * Get the list of taxonomy objects.
	 *
	 * @param state Data state.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getTaxonomies(
		state: State,
		query?: GetRecordsHttpQuery
	): Nullable< Array< ET.Taxonomy > >;

	/**
	 * Get sidebar by ID.
	 *
	 * @param state Data state.
	 * @param id    Sidebar ID.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getSidebar(
		state: State,
		id: string,
		query?: GetRecordsHttpQuery
	): ET.Sidebar | undefined;

	/**
	 * Get the sidebar list.
	 *
	 * @param state Data state.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getSidebars(
		state: State,
		query?: GetRecordsHttpQuery
	): Nullable< Array< ET.Sidebar > >;

	/**
	 * Get widget by ID.
	 *
	 * @param state Data state.
	 * @param id    Sidebar ID.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getWidget(
		state: State,
		id: string,
		query?: GetRecordsHttpQuery
	): ET.Widget | undefined;

	/**
	 * Get the widgets list.
	 *
	 * @param state Data state.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getWidgets(
		state: State,
		query?: GetRecordsHttpQuery
	): Nullable< Array< ET.Widget > >;

	/**
	 * Get widget type by ID.
	 *
	 * @param state Data state.
	 * @param id    Sidebar ID.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getWidgetType(
		state: State,
		id: string,
		query?: GetRecordsHttpQuery
	): ET.WidgetType | undefined;

	/**
	 * Get widget types list.
	 *
	 * @param state Data state.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getWidgetTypes(
		state: State,
		query?: GetRecordsHttpQuery
	): Nullable< Array< ET.WidgetType > >;

	/**
	 * Get user by ID.
	 *
	 * @param state  Data state.
	 * @param userId User ID.
	 * @param query  Optional query. If requesting specific
	 */
	export declare function getUser(
		state: State,
		userId: number,
		query?: GetRecordsHttpQuery
	): ET.User | undefined;

	/**
	 * Get the users list.
	 *
	 * @param state Data state.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getUsers(
		state: State,
		query?: GetRecordsHttpQuery
	): Nullable< Array< ET.User > >;

	/**
	 * Get comment by ID.
	 *
	 * @param state     Data state.
	 * @param commentId Comment ID.
	 * @param query     Optional query. If requesting specific
	 */
	export declare function getComment(
		state: State,
		commentId: number,
		query?: GetRecordsHttpQuery
	): ET.Comment | undefined;

	/**
	 * Get the comments list.
	 *
	 * @param state Data state.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getComments(
		state: State,
		query?: GetRecordsHttpQuery
	): Nullable< Array< ET.Comment > >;

	/**
	 * Get menu by ID.
	 *
	 * @param state Data state.
	 * @param id    Menu ID.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getMenu(
		state: State,
		id: number,
		query?: GetRecordsHttpQuery
	): ET.NavMenu | undefined;

	/**
	 * Get the menus list.
	 *
	 * @param state Data state.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getMenus(
		state: State,
		query?: GetRecordsHttpQuery
	): Nullable< Array< ET.NavMenu > >;

	/**
	 * Get menu item by ID.
	 *
	 * @param state Data state.
	 * @param id    Menu item ID.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getMenuItem(
		state: State,
		id: number,
		query?: GetRecordsHttpQuery
	): ET.NavMenuItem | undefined;

	/**
	 * Get the menu items list.
	 *
	 * @param state Data state.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getMenuItems(
		state: State,
		query?: GetRecordsHttpQuery
	): Nullable< Array< ET.NavMenuItem > >;

	/**
	 * Get menu location by ID.
	 *
	 * @param state    Data state.
	 * @param location Menu location.
	 * @param query    Optional query. If requesting specific
	 */
	export declare function getMenuLocation(
		state: State,
		location: string,
		query?: GetRecordsHttpQuery
	): ET.MenuLocation | undefined;

	/**
	 * Get the menu locations.
	 *
	 * @param state Data state.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getMenuLocations(
		state: State,
		query?: GetRecordsHttpQuery
	): Nullable< Array< ET.MenuLocation > >;

	/**
	 * Get theme by stylesheet.
	 *
	 * @param state      Data state.
	 * @param stylesheet Theme stylesheet, e.g. "twentytwentyfour"
	 * @param query      Optional query. If requesting specific
	 */
	export declare function getTheme(
		state: State,
		stylesheet: string,
		query?: GetRecordsHttpQuery
	): ET.Theme | undefined;

	/**
	 * Get the themes list.
	 *
	 * @param state Data state.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getThemes(
		state: State,
		query?: GetRecordsHttpQuery
	): Nullable< Array< ET.Theme > >;

	/**
	 * Get plugin.
	 *
	 * @param state  Data state.
	 * @param plugin The plugin file, e.g. "classic-editor/classic-editor"
	 * @param query  Optional query. If requesting specific
	 */
	export declare function getPlugin(
		state: State,
		plugin: string,
		query?: GetRecordsHttpQuery
	): ET.Plugin | undefined;

	/**
	 * Get the plugins list.
	 *
	 * @param state Data state.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getPlugins(
		state: State,
		query?: GetRecordsHttpQuery
	): Nullable< Array< ET.Plugin > >;

	/**
	 * Get post status by name.
	 *
	 * @param state  Data state.
	 * @param status The name of a registered post status..
	 * @param query  Optional query. If requesting specific
	 */
	export declare function getStatus(
		state: State,
		status: string,
		query?: GetRecordsHttpQuery
	): ET.PostStatusObject | undefined;

	/**
	 * Get the list of post statuses.
	 *
	 * @param state Data state.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getStatuses(
		state: State,
		query?: GetRecordsHttpQuery
	): Nullable< Array< ET.PostStatusObject > >;

	/**
	 * Get the site object.
	 *
	 * @param state Data state.
	 * @param key   Not used.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getSite(
		state: State,
		key?: null,
		query?: GetRecordsHttpQuery
	): ET.Settings | undefined;

	/**
	 * Get the basic site information.
	 *
	 * @param state Data state.
	 * @param key   Not used.
	 * @param query Optional query. If requesting specific
	 */
	export declare function getUnstableBase(
		state: State,
		key?: null,
		query?: GetRecordsHttpQuery
	): ET.Base | undefined;
}
