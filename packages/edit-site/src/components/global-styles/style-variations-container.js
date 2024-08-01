/**
 * WordPress dependencies
 */
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { useContext, useEffect, useMemo, useState } from '@wordpress/element';
import {
	__experimentalGrid as Grid,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	DropdownMenu,
	MenuGroup,
	MenuItem,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check, moreVertical } from '@wordpress/icons';
import { privateApis as blockEditorPrivateApis } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import PreviewStyles from './preview-styles';
import Variation from './variations/variation';
import { isVariationWithProperties } from '../../hooks/use-theme-style-variations/use-theme-style-variations-by-property';
import { unlock } from '../../lock-unlock';

const { GlobalStylesContext } = unlock( blockEditorPrivateApis );

export default function StyleVariationsContainer( { gap = 2 } ) {
	const { user } = useContext( GlobalStylesContext );
	const [ currentUserStyles, setCurrentUserStyles ] = useState( user );
	const userStyles = currentUserStyles?.styles;

	useEffect( () => {
		setCurrentUserStyles( user );
	}, [ user ] );

	const { variations, currentThemeName } = useSelect( ( select ) => {
		const {
			getCurrentTheme,
			__experimentalGetCurrentThemeGlobalStylesVariations,
		} = select( coreStore );
		const currentTheme = getCurrentTheme();
		return {
			currentThemeName:
				currentTheme?.name?.rendered || currentTheme?.stylesheet,
			variations: __experimentalGetCurrentThemeGlobalStylesVariations(),
		};
	}, [] );
	const [ selectedThemeName, setSelectedThemeName ] =
		useState( currentThemeName );

	// Filter out variations that are color or typography variations.
	const fullStyleVariations = variations?.filter( ( variation ) => {
		return (
			! isVariationWithProperties( variation, [ 'color' ] ) &&
			! isVariationWithProperties( variation, [
				'typography',
				'spacing',
			] )
		);
	} );

	const themeVariations = useMemo( () => {
		const withEmptyVariation = [
			{
				title: __( 'Default' ),
				settings: {},
				styles: {},
			},
			...( fullStyleVariations ?? [] ),
		];
		return [
			...withEmptyVariation.map( ( variation ) => {
				const blockStyles = { ...variation?.styles?.blocks } || {};

				// We need to copy any user custom CSS to the variation to prevent it being lost
				// when switching variations.
				if ( userStyles?.blocks ) {
					Object.keys( userStyles.blocks ).forEach( ( blockName ) => {
						// First get any block specific custom CSS from the current user styles and merge with any custom CSS for
						// that block in the variation.
						if ( userStyles.blocks[ blockName ].css ) {
							const variationBlockStyles =
								blockStyles[ blockName ] || {};
							const customCSS = {
								css: `${
									blockStyles[ blockName ]?.css || ''
								} ${
									userStyles.blocks[ blockName ].css.trim() ||
									''
								}`,
							};
							blockStyles[ blockName ] = {
								...variationBlockStyles,
								...customCSS,
							};
						}
					} );
				}
				// Now merge any global custom CSS from current user styles with global custom CSS in the variation.
				const css =
					userStyles?.css || variation.styles?.css
						? {
								css: `${ variation.styles?.css || '' } ${
									userStyles?.css || ''
								}`,
						  }
						: {};

				const blocks =
					Object.keys( blockStyles ).length > 0
						? { blocks: blockStyles }
						: {};

				const styles = {
					...variation.styles,
					...css,
					...blocks,
				};
				return {
					...variation,
					settings: variation.settings ?? {},
					styles,
				};
			} ),
		];
	}, [ fullStyleVariations, userStyles?.blocks, userStyles?.css ] );

	if ( ! fullStyleVariations || fullStyleVariations?.length < 1 ) {
		return null;
	}

	return (
		<>
			<HStack>
				<Heading level={ 2 }>{ __( 'Theme styles' ) }</Heading>
				<DropdownMenu
					focusOnMount
					toggleProps={ {
						size: 'compact',
						variant: 'tertiary',
						tooltipPosition: 'middle left',
					} }
					label={ __( 'Theme style options' ) }
					icon={ moreVertical }
				>
					{ () => (
						<>
							<MenuGroup label={ __( 'Current theme styles' ) }>
								<MenuItem
									icon={
										selectedThemeName ===
											currentThemeName && check
									}
								>
									{ currentThemeName }
								</MenuItem>
							</MenuGroup>
							<MenuGroup label={ __( 'Other theme styles' ) }>
								<MenuItem>{ __( 'theme name here' ) }</MenuItem>
							</MenuGroup>
						</>
					) }
				</DropdownMenu>
			</HStack>
			<Grid
				columns={ 2 }
				className="edit-site-global-styles-style-variations-container"
				gap={ gap }
			>
				{ themeVariations.map( ( variation, index ) => (
					<Variation key={ index } variation={ variation }>
						{ ( isFocused ) => (
							<PreviewStyles
								label={ variation?.title }
								withHoverView
								isFocused={ isFocused }
								variation={ variation }
							/>
						) }
					</Variation>
				) ) }
			</Grid>
		</>
	);
}
