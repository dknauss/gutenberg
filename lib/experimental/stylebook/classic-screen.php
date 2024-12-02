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
