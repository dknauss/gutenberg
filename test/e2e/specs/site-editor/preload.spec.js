/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

function recordRequests( page ) {
	const requests = [];

	function onRequest( request ) {
		if (
			request.resourceType() === 'document' &&
			request.url().startsWith( 'blob:' )
		) {
			// Stop recording when the iframe is initialized.
			page.off( 'request', onRequest );
		} else if ( request.resourceType() === 'fetch' ) {
			const url = request.url();
			const urlObject = new URL( url );
			const path =
				urlObject.searchParams.get( 'rest_route' ) ??
				urlObject.pathname;
			const method = request.method();
			requests.push( [ method, path ] );
		}
	}

	page.on( 'request', onRequest );

	return requests;
}

const post = {
	status: 'publish',
	title: 'A post',
	content: `<!-- wp:paragraph -->
<p>Post content</p>
<!-- /wp:paragraph -->`,
};

test.describe( 'Preload: should make no requests before the iframe is loaded', () => {
	test.beforeAll( async ( { requestUtils } ) => {
		await requestUtils.activateTheme( 'emptytheme' );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.activateTheme( 'twentytwentyone' );
	} );

	test.beforeEach( async ( { requestUtils } ) => {
		await requestUtils.resetPreferences();
	} );

	test( 'Site Editor Root', async ( { page, admin } ) => {
		const requests = recordRequests( page );
		await admin.visitSiteEditor();
		// To do: these should all be removed or preloaded.
		expect( requests ).toEqual( [
			// There are two separate settings OPTIONS requests. We should fix
			// so the one for canUser and getEntityRecord are reused.
			[ 'OPTIONS', '/wp/v2/settings' ],
			// Seems to be coming from `enableComplementaryArea`.
			[ 'POST', '/wp/v2/users/me' ],
		] );
	} );

	test( 'Post Editor', async ( { page, admin, requestUtils } ) => {
		const requests = recordRequests( page );
		const { id } = await requestUtils.createPost( post );
		await admin.editPost( id );
		expect( requests ).toEqual( [
			// Seems to be coming from `enableComplementaryArea`.
			[ 'POST', '/wp/v2/users/me' ],
		] );
	} );

	test( 'Site Editor Page', async ( { page, admin, requestUtils } ) => {
		const requests = recordRequests( page );
		const { id } = await requestUtils.createPage( post );
		await admin.visitSiteEditor( {
			postType: 'page',
			postId: id,
			canvas: 'edit',
		} );
		expect( requests ).toEqual( [
			[ 'GET', '/wp/v2/types/page' ],
			[ 'OPTIONS', '/wp/v2/settings' ],
			[ 'GET', '/wp/v2/taxonomies' ],
			// Seems to be coming from `enableComplementaryArea`.
			[ 'POST', '/wp/v2/users/me' ],
		] );
	} );
} );
