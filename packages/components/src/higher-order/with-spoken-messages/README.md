# withSpokenMessages

## Usage

```jsx
import { withSpokenMessages, Button } from '@wordpress/components';

const MyComponentWithSpokenMessages = withSpokenMessages(
	( { speak, debouncedSpeak } ) => (
		<div>
			<Button
				variant="secondary"
				onClick={ () => speak( 'Spoken message' ) }
				__next40pxDefaultSize
			>
				Speak
			</Button>
			<Button
				variant="secondary"
				onClick={ () => debouncedSpeak( 'Delayed message' ) }
				__next40pxDefaultSize
			>
				Debounced Speak
			</Button>
		</div>
	)
);
```
