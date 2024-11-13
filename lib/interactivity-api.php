<?php
/**
 * Interactivity API functions specific for the Gutenberg editor plugin.
 *
 * @package gutenberg
 */

/**
 * Adds script data to the interactivity-router script module.
 *
 * This filter is registered conditionally anticipating a WordPress Core change to add the script module data.
 * The filter runs on 'after_setup_theme' (when Core registers Interactivity and Script Modules hooks)
 * to ensure that the conditional registration happens after Core and correctly determine whether
 * the filter should be added.
 *
 * @see https://github.com/WordPress/wordpress-develop/pull/7304
 */
function gutenberg_register_interactivity_script_module_data_hooks() {
	if ( ! has_filter( 'script_module_data_@wordpress/interactivity-router', array( wp_interactivity(), 'filter_script_module_interactivity_router_data' ) ) ) {
		add_filter(
			'script_module_data_@wordpress/interactivity-router',
			function ( $data ) {
				if ( ! isset( $data['i18n'] ) ) {
					$data['i18n'] = array();
				}
				$data['i18n']['loading'] = __( 'Loading page, please wait.', 'default' );
				$data['i18n']['loaded']  = __( 'Page Loaded.', 'default' );
				return $data;
			}
		);
	}
}
add_action( 'after_setup_theme', 'gutenberg_register_interactivity_script_module_data_hooks', 20 );

function gutenberg_block_core_query_add_url_filtering( $context ) {
	if ( empty( $context['queryId'] ) ) {
		return $context;
	}

	// if the parent block is NOT a Query Loop block, then we bail out
	if ( empty( $context['query']['inherit'] ) ) {
		return $context;
	}

	$search_key = 'query-' . $context['queryId'] . '-s';
	if ( ! isset( $_GET[ $search_key ] ) ) {
		return $context;
	}

	$context['query']['search'] = sanitize_text_field( $_GET[ $search_key ] );

	return $context;
}
add_filter( 'render_block_context', 'gutenberg_block_core_query_add_url_filtering' );
