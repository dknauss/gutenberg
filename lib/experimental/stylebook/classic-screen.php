<?php
/**
 * Set up a screen to show stylebook for classic themes.
 *
 * @package gutenberg
 */

/**
 * Add a Styles submenu under the Appearance menu
 * for Classic themes.
 *
 * @global array $submenu
 */
function gutenberg_add_styles_submenu_item() {
	if ( ! wp_is_block_theme() ) {
		global $submenu;

		$styles_menu_item = array(
			__( 'Design', 'gutenberg' ),
			'edit_theme_options',
			'site-editor.php',
		);
		// If $submenu exists, insert the Styles submenu item at position 2.
		if ( $submenu && isset( $submenu['themes.php'] ) ) {
			// This might not work as expected if the submenu has already been modified.
			array_splice( $submenu['themes.php'], 1, 1, array( $styles_menu_item ) );
		}
	}
}
add_action( 'admin_init', 'gutenberg_add_styles_submenu_item' );

/**
 * Filter the `wp_die_handler` to allow access to the Site Editor's Styles page
 * for Classic themes.
 *
 * @param callable $default_handler The default handler.
 * @return callable The default handler or a custom handler.
 */
function gutenberg_styles_wp_die_handler( $default_handler ) {
	if ( ! wp_is_block_theme() && str_contains( $_SERVER['REQUEST_URI'], 'site-editor.php' ) ) {
		return '__return_false';
	}
	return $default_handler;
}
add_filter( 'wp_die_handler', 'gutenberg_styles_wp_die_handler' );
