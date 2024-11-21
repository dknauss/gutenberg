/**
 * Internal dependencies
 */
import { test, expect } from './fixtures';
/**
 * External dependencies
 */
import type { Page } from '@playwright/test';

/**
 * Go to the next page of the query.
 * @param page       - The page object.
 * @param pageNumber - The page number to navigate to.
 * @param testId     - The test ID of the query.
 * @param queryId    - The query ID.
 */
async function goToNextPage(
	page: Page,
	pageNumber: number,
	testId: string,
	queryId: number
) {
	await page
		.getByTestId( testId )
		.getByRole( 'link', { name: 'Next Page' } )
		.click();

	// Wait for the response
	return page.waitForResponse( ( response ) =>
		response.url().includes( `query-${ queryId }-page=${ pageNumber }` )
	);
}

test.describe( 'Instant Search', () => {
	test.beforeAll( async ( { requestUtils } ) => {
		await requestUtils.activateTheme( 'emptytheme' );
		await requestUtils.setGutenbergExperiments( [
			'gutenberg-search-query-block',
		] );
		await requestUtils.deleteAllPosts();

		// Create test posts
		// Make sure to create them last-to-first to avoid flakiness
		await requestUtils.createPost( {
			title: 'Unique Post',
			content: 'This post has unique content.',
			status: 'publish',
			date_gmt: new Date(
				new Date().getTime() - 1000 * 60 * 60 * 24 * 5
			).toISOString(),
		} );
		await requestUtils.createPost( {
			title: 'Fourth Test Post',
			content: 'This is the fourth test post content.',
			status: 'publish',
			date_gmt: new Date(
				new Date().getTime() - 1000 * 60 * 60 * 24 * 4
			).toISOString(),
		} );
		await requestUtils.createPost( {
			title: 'Third Test Post',
			content: 'This is the third test post content.',
			status: 'publish',
			date_gmt: new Date(
				new Date().getTime() - 1000 * 60 * 60 * 24 * 3
			).toISOString(),
		} );
		await requestUtils.createPost( {
			title: 'Second Test Post',
			content: 'This is the second test post content.',
			status: 'publish',
			date_gmt: new Date(
				new Date().getTime() - 1000 * 60 * 60 * 24 * 2
			).toISOString(),
		} );
		await requestUtils.createPost( {
			title: 'First Test Post',
			content: 'This is the first test post content.',
			status: 'publish',
			date_gmt: new Date(
				new Date().getTime() - 1000 * 60 * 60 * 24 * 1
			).toISOString(),
		} );

		// Set the Blog pages show at most 2 posts
		await requestUtils.updateSiteSettings( {
			posts_per_page: 2,
		} );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.deleteAllPosts();
		await requestUtils.activateTheme( 'twentytwentyone' );
	} );

	test.describe( 'Custom Query', () => {
		let pageId: number;

		const queryId = 123;

		test.beforeAll( async ( { requestUtils } ) => {
			// Create page with custom query
			const { id } = await requestUtils.createPage( {
				status: 'publish',
				date_gmt: new Date().toISOString(),
				title: 'Custom Query',
				content: `
<!-- wp:query {"enhancedPagination":true,"queryId":${ queryId },"query":{"inherit":false,"perPage":2,"order":"desc","orderBy":"date","offset":0}} -->
  <div class="wp-block-query" data-testid="custom-query">
		<!-- wp:search {"label":"","buttonText":"Search"} /-->
		<!-- wp:post-template -->
			<!-- wp:post-title {"level":3} /-->
			<!-- wp:post-excerpt /-->
		<!-- /wp:post-template -->
		<!-- wp:query-pagination -->
			<!-- wp:query-pagination-previous /-->
			<!-- wp:query-pagination-numbers /-->
			<!-- wp:query-pagination-next /-->
		<!-- /wp:query-pagination -->
		<!-- wp:query-no-results -->
			<!-- wp:paragraph -->
			<p>No results found.</p>
			<!-- /wp:paragraph -->
		<!-- /wp:query-no-results -->
	</div>
<!-- /wp:query -->`,
			} );

			pageId = id;
		} );

		test.beforeEach( async ( { page } ) => {
			await page.goto( `/?p=${ pageId }` );
		} );

		test( 'should update search results without page reload', async ( {
			page,
		} ) => {
			// Check that the first post is shown initially
			await expect(
				page.getByText( 'First Test Post', { exact: true } )
			).toBeVisible();

			// Type in search input and verify results update
			await page.locator( 'input[type="search"]' ).fill( 'Unique' );
			await page.waitForResponse( ( response ) =>
				response.url().includes( `instant-search-${ queryId }=Unique` )
			);

			// Verify only the unique post is shown
			await expect(
				page.getByText( 'Unique Post', { exact: true } )
			).toBeVisible();

			// Check that there is only one post
			const posts = page
				.getByTestId( 'custom-query' )
				.getByRole( 'heading', { level: 3 } );
			await expect( posts ).toHaveCount( 1 );

			// Verify that the other posts are hidden
			await expect(
				page.getByText( 'First Test Post', { exact: true } )
			).toBeHidden();
		} );

		test( 'should update URL with search parameter', async ( { page } ) => {
			// Test global query search parameter
			await page.locator( 'input[type="search"]' ).fill( 'Test' );
			await expect( page ).toHaveURL(
				new RegExp( `instant-search-${ queryId }=Test` )
			);

			// Clear search and verify parameter is removed
			await page.locator( 'input[type="search"]' ).fill( '' );
			await expect( page ).not.toHaveURL(
				new RegExp( `instant-search-${ queryId }=` )
			);
		} );

		test( 'should handle search debouncing', async ( { page } ) => {
			let responseCount = 0;

			// Monitor the number of requests
			page.on( 'response', ( res ) => {
				if ( res.url().includes( `instant-search-${ queryId }=` ) ) {
					responseCount++;
				}
			} );

			// Type quickly and wait for the response
			let responsePromise = page.waitForResponse( ( response ) => {
				return (
					response
						.url()
						.includes( `instant-search-${ queryId }=Test` ) &&
					response.status() === 200
				);
			} );
			await page
				.locator( 'input[type="search"]' )
				.pressSequentially( 'Test', { delay: 100 } );
			await responsePromise;

			// Check that only one request was made
			expect( responseCount ).toBe( 1 );

			// Verify URL is updated after debounce
			await expect( page ).toHaveURL(
				new RegExp( `instant-search-${ queryId }=Test` )
			);

			responsePromise = page.waitForResponse( ( response ) => {
				return response
					.url()
					.includes( `instant-search-${ queryId }=Test1234` );
			} );
			// Type again with a large delay and verify that a request is made
			// for each character
			await page
				.locator( 'input[type="search"]' )
				.pressSequentially( '1234', { delay: 500 } );
			await responsePromise;

			// Check that five requests were made (Test, Test1, Test12, Test123, Test1234)
			expect( responseCount ).toBe( 5 );
		} );

		test( 'should reset pagination when searching', async ( { page } ) => {
			// Navigate to second page
			await page.click( 'a.wp-block-query-pagination-next' );

			await expect( page ).toHaveURL(
				new RegExp( `query-${ queryId }-page=2` )
			);

			// Search and verify we're back to first page
			await page.locator( 'input[type="search"]' ).fill( 'Test' );
			await expect( page ).not.toHaveURL(
				new RegExp( `query-${ queryId }-page=2` )
			);

			// The url should now contain `?paged=1` because we're on the first page
			// We cannot remove the `paged` param completely because the pathname
			// might contain the `/page/2` suffix so we need to set `paged` to `1` to
			// override it.
			await expect( page ).toHaveURL(
				new RegExp( `query-${ queryId }-page=1` )
			);
		} );

		test( 'should show no-results block when search has no matches', async ( {
			page,
		} ) => {
			await page
				.locator( 'input[type="search"]' )
				.fill( 'NonexistentContent' );
			await page.waitForResponse( ( response ) =>
				response
					.url()
					.includes(
						`instant-search-${ queryId }=NonexistentContent`
					)
			);

			// Verify no-results block is shown
			await expect( page.getByText( 'No results found.' ) ).toBeVisible();
		} );

		test( 'should update pagination numbers based on search results', async ( {
			page,
		} ) => {
			// Initially should show pagination numbers for 3 pages
			await expect(
				page.locator( '.wp-block-query-pagination-numbers' )
			).toBeVisible();
			await expect(
				page.getByRole( 'link', { name: '2' } )
			).toBeVisible();
			await expect(
				page.getByRole( 'link', { name: '3' } )
			).toBeVisible();

			// Search for unique post
			await page.locator( 'input[type="search"]' ).fill( 'Unique' );
			await page.waitForResponse( ( response ) =>
				response.url().includes( `instant-search-${ queryId }=Unique` )
			);

			// Pagination numbers should not be visible with single result
			await expect(
				page.locator( '.wp-block-query-pagination-numbers' )
			).toBeHidden();
		} );

		test( 'should handle pre-defined search from query attributes', async ( {
			requestUtils,
			page,
		} ) => {
			// Create page with custom query that includes a search parameter
			const { id } = await requestUtils.createPage( {
				status: 'publish',
				title: 'Query with Search',
				content: `
<!-- wp:query {"enhancedPagination":true,"queryId":${ queryId },"query":{"inherit":false,"perPage":2,"order":"desc","orderBy":"date","offset":0,"search":"Unique"}} -->
    <div class="wp-block-query" data-testid="query-with-search">
        <!-- wp:search {"label":"","buttonText":"Search"} /-->
        <!-- wp:post-template -->
            <!-- wp:post-title {"level":3} /-->
            <!-- wp:post-excerpt /-->
        <!-- /wp:post-template -->
        <!-- wp:query-pagination -->
            <!-- wp:query-pagination-previous /-->
            <!-- wp:query-pagination-numbers /-->
            <!-- wp:query-pagination-next /-->
        <!-- /wp:query-pagination -->
        <!-- wp:query-no-results -->
            <!-- wp:paragraph -->
            <p>No results found.</p>
            <!-- /wp:paragraph -->
        <!-- /wp:query-no-results -->
    </div>
<!-- /wp:query -->`,
			} );

			// Navigate to the page
			await page.goto( `/?p=${ id }` );

			// Verify the search input has the initial value
			await expect( page.locator( 'input[type="search"]' ) ).toHaveValue(
				'Unique'
			);

			// Verify only the unique post is shown
			await expect(
				page.getByText( 'Unique Post', { exact: true } )
			).toBeVisible();
			const posts = page
				.getByTestId( 'query-with-search' )
				.getByRole( 'heading', { level: 3 } );
			await expect( posts ).toHaveCount( 1 );

			// Verify URL does not contain the instant-search parameter
			await expect( page ).not.toHaveURL(
				new RegExp( `instant-search-${ queryId }=` )
			);

			// Type new search term and verify normal instant search behavior
			await page.locator( 'input[type="search"]' ).fill( 'Test' );
			await page.waitForResponse( ( response ) =>
				response.url().includes( `instant-search-${ queryId }=Test` )
			);

			// Verify URL now contains the instant-search parameter
			await expect( page ).toHaveURL(
				new RegExp( `instant-search-${ queryId }=Test` )
			);

			// Verify search results update
			await expect(
				page.getByText( 'First Test Post', { exact: true } )
			).toBeVisible();
		} );
	} );

	test.describe( 'Multiple Queries', () => {
		const firstQueryId = 1234;
		const secondQueryId = 5678;

		test.beforeAll( async ( { requestUtils } ) => {
			// Edit the Home template to include two custom queries
			await requestUtils.createPage( {
				status: 'publish',
				title: 'Home',
				content: `
<!-- wp:query {"enhancedPagination":true,"queryId":${ firstQueryId },"query":{"inherit":false,"perPage":2,"order":"desc","orderBy":"date","offset":0}} -->
	<div class="wp-block-query" data-testid="first-query">
		<!-- wp:heading -->
		<h2>First Query</h2>
		<!-- /wp:heading -->
		<!-- wp:search {"label":"1st-instant-search","buttonText":"Search"} /-->
		<!-- wp:post-template -->
			<!-- wp:post-title {"level":3} /-->
			<!-- wp:post-excerpt /-->
		<!-- /wp:post-template -->
		<!-- wp:query-pagination -->
			<!-- wp:query-pagination-previous /-->
			<!-- wp:query-pagination-numbers /-->
			<!-- wp:query-pagination-next /-->
		<!-- /wp:query-pagination -->
		<!-- wp:query-no-results -->
			<!-- wp:paragraph -->
			<p>No results found.</p>
			<!-- /wp:paragraph -->
		<!-- /wp:query-no-results -->
	</div>
<!-- /wp:query -->

<!-- wp:query {"enhancedPagination":true,"queryId":${ secondQueryId },"query":{"inherit":false,"perPage":2,"order":"desc","orderBy":"date","offset":0}} -->
	<div class="wp-block-query" data-testid="second-query">
		<!-- wp:heading -->
		<h2>Second Query</h2>
		<!-- /wp:heading -->
		<!-- wp:search {"label":"2nd-instant-search","buttonText":"Search"} /-->
		<!-- wp:post-template -->
			<!-- wp:post-title {"level":3} /-->
			<!-- wp:post-excerpt /-->
		<!-- /wp:post-template -->
		<!-- wp:query-pagination -->
			<!-- wp:query-pagination-previous /-->
			<!-- wp:query-pagination-numbers /-->
			<!-- wp:query-pagination-next /-->
		<!-- /wp:query-pagination -->
		<!-- wp:query-no-results -->
			<!-- wp:paragraph -->
			<p>No results found.</p>
			<!-- /wp:paragraph -->
		<!-- /wp:query-no-results -->
	</div>
<!-- /wp:query -->`,
			} );
		} );

		test.beforeEach( async ( { page } ) => {
			await page.goto( '/' );
		} );

		test( 'should handle searches independently', async ( { page } ) => {
			// Get search inputs
			const firstQuerySearch = page.getByLabel( '1st-instant-search' );
			const secondQuerySearch = page.getByLabel( '2nd-instant-search' );

			// Search in first query
			await firstQuerySearch.fill( 'Unique' );
			await page.waitForResponse( ( response ) =>
				response
					.url()
					.includes( `instant-search-${ firstQueryId }=Unique` )
			);

			// Verify first query ONLY shows the unique post
			await expect(
				page
					.getByTestId( 'first-query' )
					.getByText( 'Unique Post', { exact: true } )
			).toBeVisible();

			// Verify that the second query shows exactly 2 posts: First Test Post and Second Test Post
			const secondQuery = page.getByTestId( 'second-query' );
			const posts = secondQuery.getByRole( 'heading', { level: 3 } );
			await expect( posts ).toHaveCount( 2 );
			await expect( posts ).toContainText( [
				'First Test Post',
				'Second Test Post',
			] );

			// Search in second query
			await secondQuerySearch.fill( 'Third' );
			await page.waitForResponse( ( response ) =>
				response
					.url()
					.includes( `instant-search-${ secondQueryId }=Third` )
			);

			// Verify URL contains both search parameters
			await expect( page ).toHaveURL(
				new RegExp( `instant-search-${ firstQueryId }=Unique` )
			);
			await expect( page ).toHaveURL(
				new RegExp( `instant-search-${ secondQueryId }=Third` )
			);

			// Verify that the first query has only one post which is the "Unique" post
			const firstQueryPosts = page
				.getByTestId( 'first-query' )
				.getByRole( 'heading', { level: 3 } );
			await expect( firstQueryPosts ).toHaveCount( 1 );
			await expect( firstQueryPosts ).toContainText( 'Unique Post' );

			// Verify that the second query has only one post which is the "Third Test Post"
			const secondQueryPosts = page
				.getByTestId( 'second-query' )
				.getByRole( 'heading', { level: 3 } );
			await expect( secondQueryPosts ).toHaveCount( 1 );
			await expect( secondQueryPosts ).toContainText( 'Third Test Post' );

			// Clear first query search
			await firstQuerySearch.fill( '' );
			await expect( page ).not.toHaveURL(
				new RegExp( `instant-search-${ firstQueryId }=` )
			);
			await expect( page ).toHaveURL(
				new RegExp( `instant-search-${ secondQueryId }=Third` )
			);

			// Clear second query search
			await secondQuerySearch.fill( '' );
			await expect( page ).not.toHaveURL(
				new RegExp( `instant-search-${ secondQueryId }=` )
			);
		} );

		test( 'should handle pagination independently', async ( { page } ) => {
			const firstQuerySearch = page.getByLabel( '1st-instant-search' );
			const secondQuerySearch = page.getByLabel( '2nd-instant-search' );

			// Navigate to second page in first query
			await goToNextPage( page, 2, 'first-query', firstQueryId );

			// Navigate to second page in second query
			await goToNextPage( page, 2, 'second-query', secondQueryId );

			// Navigate to third page in second query
			await goToNextPage( page, 3, 'second-query', secondQueryId );

			// Verify URL contains both pagination parameters
			await expect( page ).toHaveURL(
				new RegExp( `query-${ firstQueryId }-page=2` )
			);
			await expect( page ).toHaveURL(
				new RegExp( `query-${ secondQueryId }-page=3` )
			);

			// Search in first query and verify only its pagination resets
			await firstQuerySearch.fill( 'Test' );
			await expect( page ).toHaveURL(
				new RegExp( `query-${ firstQueryId }-page=1` )
			);
			await expect( page ).toHaveURL(
				new RegExp( `query-${ secondQueryId }-page=3` )
			);

			// Search in second query and verify only its pagination resets
			await secondQuerySearch.fill( 'Test' );
			await expect( page ).toHaveURL(
				new RegExp( `query-${ firstQueryId }-page=1` )
			);
			await expect( page ).toHaveURL(
				new RegExp( `query-${ secondQueryId }-page=1` )
			);
		} );
	} );
} );
