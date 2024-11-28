/**
 * External dependencies
 */
import { h, createContext } from 'preact';
import { useContext, useEffect } from 'preact/hooks';
import { signal } from '@preact/signals';

const slotsContext = createContext( { value: {} } );

export const Fill = ( { slot, children = null } ) => {
	const slots = useContext( slotsContext );

	useEffect( () => {
		if ( slot ) {
			slots.value = { ...slots.value, [ slot ]: children };
			return () => {
				slots.value = { ...slots.value, [ slot ]: null };
			};
		}
		return undefined;
	}, [ slots, slot, children ] );

	return !! slot ? null : children;
};

export const SlotProvider = ( { children } ) => {
	return (
		// TODO: We can change this to use deepsignal once this PR is merged.
		// https://github.com/luisherranz/deepsignal/pull/38
		h( slotsContext.Provider, { value: signal( {} ) }, children )
	);
};

export const Slot = ( { name, children = null } ) => {
	const slots = useContext( slotsContext );
	return slots.value[ name ] || children;
};
