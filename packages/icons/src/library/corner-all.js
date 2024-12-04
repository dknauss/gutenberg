/**
 * WordPress dependencies
 */
import { SVG, Path } from '@wordpress/primitives';

const cornerAll = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M5.75 6A.25.25 0 0 1 6 5.75h3v-1.5H6A1.75 1.75 0 0 0 4.25 6v3h1.5V6ZM18 18.25h-3v1.5h3A1.75 1.75 0 0 0 19.75 18v-3h-1.5v3a.25.25 0 0 1-.25.25ZM18.25 9V6a.25.25 0 0 0-.25-.25h-3v-1.5h3c.966 0 1.75.784 1.75 1.75v3h-1.5Zm-12.5 9v-3h-1.5v3c0 .966.784 1.75 1.75 1.75h3v-1.5H6a.25.25 0 0 1-.25-.25Z"
		/>
	</SVG>
);

export default cornerAll;
