/**
 * WordPress dependencies
 */
import { forwardRef, useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type { WordPressComponentProps } from '../context';
import type { MenuItemProps } from './types';
import * as Styled from './styles';
import { MenuContext } from './context';

export const MenuItem = forwardRef<
	HTMLDivElement,
	WordPressComponentProps< MenuItemProps, 'div', false >
>( function MenuItem(
	{ prefix, suffix, children, hideOnClick = true, store, ...props },
	ref
) {
	const menuContext = useContext( MenuContext );

	if ( ! menuContext?.store ) {
		throw new Error(
			'Menu.Item can only be rendered inside a Menu component'
		);
	}

	const computedStore = store ?? menuContext.store;

	return (
		<Styled.MenuItem
			ref={ ref }
			{ ...props }
			accessibleWhenDisabled
			hideOnClick={ hideOnClick }
			store={ computedStore }
		>
			<Styled.ItemPrefixWrapper>{ prefix }</Styled.ItemPrefixWrapper>

			<Styled.MenuItemContentWrapper>
				<Styled.MenuItemChildrenWrapper>
					{ children }
				</Styled.MenuItemChildrenWrapper>

				{ suffix && (
					<Styled.ItemSuffixWrapper>
						{ suffix }
					</Styled.ItemSuffixWrapper>
				) }
			</Styled.MenuItemContentWrapper>
		</Styled.MenuItem>
	);
} );
