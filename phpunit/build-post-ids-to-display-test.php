<?php

/**
 * Test the build_post_ids_to_display function.
 *
 * @package Gutenberg
 */
class SortIdsByHierarchyTest extends WP_UnitTestCase {

	/*
	 * Keep this updated as the input array changes.
	 * The sorted hierarchy would be as follows:
	 *
	 * 2
	 * - 3
	 * -- 5
	 * -- 6
	 * - 4
	 * -- 7
	 * 8
	 * - 9
	 * -- 11
	 * - 10
	 *
	 */
	private $input;

	public function setUp(): void {
		parent::setUp();
		$this->input = array(
			(object) array(
				'ID'          => 11,
				'post_parent' => 9,
			),
			(object) array(
				'ID'          => 2,
				'post_parent' => 0,
			),
			(object) array(
				'ID'          => 8,
				'post_parent' => 0,
			),
			(object) array(
				'ID'          => 3,
				'post_parent' => 2,
			),
			(object) array(
				'ID'          => 5,
				'post_parent' => 3,
			),
			(object) array(
				'ID'          => 7,
				'post_parent' => 4,
			),
			(object) array(
				'ID'          => 9,
				'post_parent' => 8,
			),
			(object) array(
				'ID'          => 4,
				'post_parent' => 2,
			),
			(object) array(
				'ID'          => 6,
				'post_parent' => 3,
			),
			(object) array(
				'ID'          => 10,
				'post_parent' => 8,
			),
		);
	}

	public function test_return_all_post_ids() {
		$hs     = Hierarchical_Sort::init();
		$result = $hs->sort( $this->input );
		$this->assertEquals( array( 2, 3, 5, 6, 4, 7, 8, 9, 11, 10 ), $result['post_ids'] );
		$this->assertEquals(
			array(
				2  => 0,
				3  => 1,
				5  => 2,
				6  => 2,
				4  => 1,
				7  => 2,
				8  => 0,
				9  => 1,
				11 => 2,
				10 => 1,
			),
			$result['levels']
		);
	}
}
