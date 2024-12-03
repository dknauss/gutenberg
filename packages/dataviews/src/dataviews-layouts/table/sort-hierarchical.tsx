/**
 * WordPress dependencies
 */
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import DataViewsContext from '../../components/dataviews-context';
import type { ViewTable } from '../../types';

function SortHierarchicalControl() {
	const context = useContext( DataViewsContext );
	const view = context.view as ViewTable;
	const onChangeView = context.onChangeView;

	return (
		<ToggleGroupControl
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			isBlock
			label={ __( 'Hierarchy' ) }
			value={
				view.layout?.hierarchicalSort === true ? 'enabled' : 'disabled'
			}
			onChange={ ( value ) => {
				onChangeView( {
					...view,
					layout: {
						...view.layout,
						hierarchicalSort: value === 'enabled',
					},
				} );
			} }
		>
			<ToggleGroupControlOption
				key="enabled"
				value="enabled"
				label={ __( 'Enabled' ) }
			/>
			<ToggleGroupControlOption
				key="disabled"
				value="disabled"
				label={ __( 'Disabled' ) }
			/>
		</ToggleGroupControl>
	);
}

export default SortHierarchicalControl;
