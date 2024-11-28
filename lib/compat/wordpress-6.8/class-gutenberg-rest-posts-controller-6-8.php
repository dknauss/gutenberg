<?php

/**
 * A custom REST server for Gutenberg.
 *
 * @package gutenberg
 * @since   6.8.0
 */

class Hierarchical_Sort {


	private static $post_ids = array();
	private static $levels   = array();
	private static $instance;

	public static function init() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public function run( $args ) {
		$new_args = array_merge(
			$args,
			array(
				'fields'         => 'id=>parent',
				'posts_per_page' => -1,
			)
		);
		$query    = new WP_Query( $new_args );
		$posts    = $query->posts;
		$result   = self::sort( $posts );

		self::$post_ids = $result['post_ids'];
		self::$levels   = $result['levels'];
	}

	/**
	 * Sort the post ids by hierarchy.
	 *
	 * Example: $posts is
	 * [
	 *   ['ID' => 4, 'post_parent' => 2],
	 *   ['ID' => 2, 'post_parent' => 0],
	 *   ['ID' => 3, 'post_parent' => 2],
	 * ]
	 *
	 * and we want to return: [2, 3, 4]
	 *
	 * @param array $posts The posts to sort.
	 * @param array $args  The arguments to sort the posts by.
	 *
	 * @return array Return the sorted post_ids and the corresponding levels.
	 */
	public static function sort( $posts ) {
		/*
		 * Arrange pages in two arrays:
		 *
		 * - $top_level: posts whose parent is 0
		 * - $parent_children: post ID as the key and an array of children post IDs as the value.
		 *   Example: parent_children[10][] contains all sub-pages whose parent is 10.
		 *
		 * Additionally, keep track of the levels of each post in $levels.
		 * Example: $levels[10] = 0 means the post ID is a top-level page.
		 *
		 */
		$top_level       = array();
		$parent_children = array();
		foreach ( $posts as $post ) {
			if ( 0 === $post->post_parent ) {
				$top_level[] = $post->ID;
			} else {
				$parent_children[ $post->post_parent ][] = $post->ID;
			}
		}

		$ids    = array();
		$levels = array();
		self::add_hierarchical_ids( $ids, $levels, 0, $top_level, $parent_children );

		return array(
			'post_ids' => $ids,
			'levels'   => $levels,
		);
	}

	private static function add_hierarchical_ids( &$ids, &$levels, $level, $to_process, $parent_children ) {
		foreach ( $to_process as $id ) {
			$ids[]         = $id;
			$levels[ $id ] = $level;

			if ( isset( $parent_children[ $id ] ) ) {
				self::add_hierarchical_ids( $ids, $levels, $level + 1, $parent_children[ $id ], $parent_children );
			}
		}
	}

	public static function get_post_ids() {
		return self::$post_ids;
	}

	public static function get_levels() {
		return self::$levels;
	}
}

add_filter(
	'rest_page_collection_params',
	function ( $params ) {
		$params['orderby_hierarchy'] = array(
			'description' => 'Sort pages by hierarchy.',
			'type'        => 'boolean',
			'default'     => false,
		);
		return $params;
	}
);

add_filter(
	'rest_page_query',
	function ( $args, $request ) {
		if ( isset( $request['orderby_hierarchy'] ) && true === $request['orderby_hierarchy'] ) {
			$hs = Hierarchical_Sort::init();
			$hs->run( $args );

			// Reconfigure the args to display only the ids in the list.
			$args['post__in'] = $hs->get_post_ids();
			$args['orderby']  = 'post__in';
		}

		return $args;
	},
	10,
	2
);

add_filter(
	'rest_prepare_page',
	function ( $response, $post, $request ) {
		if ( isset( $request['orderby_hierarchy'] ) && true === $request['orderby_hierarchy'] ) {
			$hs                      = Hierarchical_Sort::init();
			$response->data['level'] = $hs->get_levels()[ $post->ID ];
		}

		return $response;
	},
	10,
	3
);
