/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'Preload', () => {
	test.beforeAll( async ( { requestUtils } ) => {
		await requestUtils.activateTheme( 'emptytheme' );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.activateTheme( 'twentytwentyone' );
	} );

	test( 'Should make no requests before the iframe is loaded', async ( {
		page,
		admin,
	} ) => {
		// Do not use `visitSiteEditor` because it waits for the iframe to load.
		await admin.visitAdminPage( 'site-editor.php' );

		const requests = [];
		let isLoaded = false;

		page.on( 'request', ( request ) => {
			if ( request.resourceType() === 'document' ) {
				// The iframe also "requests" a blob document. This is the most
				// reliable way to wait for the iframe to start loading.
				// `waitForSelector` is always a bit delayed, and we don't want
				// to detect requests after the iframe mounts.
				isLoaded = true;
			} else if ( ! isLoaded && request.resourceType() === 'fetch' ) {
				requests.push( request.url() );
			}
		} );

		await page.waitForFunction( ( _isLoaded ) => _isLoaded, [ isLoaded ] );

		expect( requests ).toEqual( [] );
	} );
} );
