/**
 * WordPress dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import {
	InnerBlocks,
	useBlockProps,
	InspectorControls,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { SelectControl, TextControl } from '@wordpress/components';
import { useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { View } from '@wordpress/primitives';

/**
 * Internal dependencies
 */
import GroupPlaceHolder, { useShouldShowPlaceHolder } from './placeholder';

/**
 * Render inspector controls for the Group block.
 *
 * @param {Object}           props                   Component props.
 * @param {string}           props.tagName           The HTML tag name.
 * @param {string|undefined} props.ariaLabel         The aria-label attribute value.
 * @param {Function}         props.onSelectTagName   onChange function for the SelectControl.
 * @param {Function}         props.onChangeAriaLabel onChange function for the TextControl.
 * @return {JSX.Element}                The control group.
 */
function GroupEditControls( {
	tagName,
	ariaLabel,
	onSelectTagName,
	onChangeAriaLabel,
} ) {
	const htmlElementMessages = {
		header: __(
			'The <header> element should represent introductory content, typically a group of introductory or navigational aids.'
		),
		main: __(
			'The <main> element should be used for the primary content of your document only.'
		),
		section: __(
			"The <section> element should represent a standalone portion of the document that can't be better represented by another element."
		),
		article: __(
			'The <article> element should represent a self-contained, syndicatable portion of the document.'
		),
		aside: __(
			"The <aside> element should represent a portion of a document whose content is only indirectly related to the document's main content."
		),
		footer: __(
			'The <footer> element should represent a footer for its nearest sectioning element (e.g.: <section>, <article>, <main> etc.).'
		),
		nav: __(
			'The <nav> element should represent a section of a page that links to other pages or to parts within the page.'
		),
	};
	return (
		<InspectorControls group="advanced">
			<SelectControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label={ __( 'HTML element' ) }
				options={ [
					{ label: __( 'Default (<div>)' ), value: 'div' },
					{ label: '<header>', value: 'header' },
					{ label: '<main>', value: 'main' },
					{ label: '<section>', value: 'section' },
					{ label: '<article>', value: 'article' },
					{ label: '<aside>', value: 'aside' },
					{ label: '<footer>', value: 'footer' },
					{ label: '<nav>', value: 'nav' },
				] }
				value={ tagName }
				onChange={ onSelectTagName }
				help={ htmlElementMessages[ tagName ] }
			/>
			{ tagName === 'nav' && (
				<TextControl
					label={ __( 'Navigation label' ) }
					value={ ariaLabel || '' }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					onChange={ onChangeAriaLabel }
					help={ __(
						'Add a label to describe the purpose of this navigation element.'
					) }
				/>
			) }
		</InspectorControls>
	);
}

function GroupEdit( { attributes, name, setAttributes, clientId } ) {
	const { hasInnerBlocks, themeSupportsLayout } = useSelect(
		( select ) => {
			const { getBlock, getSettings } = select( blockEditorStore );
			const block = getBlock( clientId );
			return {
				hasInnerBlocks: !! ( block && block.innerBlocks.length ),
				themeSupportsLayout: getSettings()?.supportsLayout,
			};
		},
		[ clientId ]
	);

	const {
		tagName: TagName = 'div',
		templateLock,
		allowedBlocks,
		ariaLabel,
		layout = {},
	} = attributes;

	// Layout settings.
	const { type = 'default' } = layout;
	const layoutSupportEnabled =
		themeSupportsLayout || type === 'flex' || type === 'grid';

	// Hooks.
	const ref = useRef();
	const blockProps = useBlockProps( { ref } );

	const [ showPlaceholder, setShowPlaceholder ] = useShouldShowPlaceHolder( {
		attributes,
		usedLayoutType: type,
		hasInnerBlocks,
	} );

	// Default to the regular appender being rendered.
	let renderAppender;
	if ( showPlaceholder ) {
		// In the placeholder state, ensure the appender is not rendered.
		// This is needed because `...innerBlocksProps` is used in the placeholder
		// state so that blocks can dragged onto the placeholder area
		// from both the list view and in the editor canvas.
		renderAppender = false;
	} else if ( ! hasInnerBlocks ) {
		// When there is no placeholder, but the block is also empty,
		// use the larger button appender.
		renderAppender = InnerBlocks.ButtonBlockAppender;
	}

	const innerBlocksProps = useInnerBlocksProps(
		layoutSupportEnabled
			? blockProps
			: { className: 'wp-block-group__inner-container' },
		{
			dropZoneElement: ref.current,
			templateLock,
			allowedBlocks,
			renderAppender,
		}
	);

	const { selectBlock } = useDispatch( blockEditorStore );

	const selectVariation = ( nextVariation ) => {
		setAttributes( nextVariation.attributes );
		selectBlock( clientId, -1 );
		setShowPlaceholder( false );
	};

	return (
		<>
			<GroupEditControls
				tagName={ TagName }
				ariaLabel={ ariaLabel }
				onSelectTagName={ ( value ) => {
					setAttributes( { tagName: value, ariaLabel: undefined } );
				} }
				onChangeAriaLabel={ ( value ) => {
					setAttributes( { ariaLabel: value } );
				} }
			/>
			{ showPlaceholder && (
				<View>
					{ innerBlocksProps.children }
					<GroupPlaceHolder
						name={ name }
						onSelect={ selectVariation }
					/>
				</View>
			) }
			{ layoutSupportEnabled && ! showPlaceholder && (
				<TagName { ...innerBlocksProps } />
			) }
			{ /* Ideally this is not needed but it's there for backward compatibility reason
				to keep this div for themes that might rely on its presence */ }
			{ ! layoutSupportEnabled && ! showPlaceholder && (
				<TagName { ...blockProps }>
					<div { ...innerBlocksProps } />
				</TagName>
			) }
		</>
	);
}

export default GroupEdit;
