<?php
/**
 * Adds theme creation experimental functionality.
 *
 * @package gutenberg
 */

/**
 * Add a menu item for the theme creation page
 */
function gutenberg_create_theme_menu() {
		add_submenu_page( 'themes.php', __( 'Create theme', 'gutenberg' ), __( 'Create theme', 'gutenberg' ), 'edit_theme_options', 'site-editor.php?p=themes' );
}
add_action( 'admin_menu', 'gutenberg_create_theme_menu', 9 );
