import { useSyncExternalStore } from "react";

// Whether the "Complete your registration" dialog is open. Kept outside React so the
// game launcher and the payment pages can open it from anywhere.
let isOpen = false;
const listeners = new Set<() => void>();

const emit = () => {
	for (const listener of listeners) listener();
};

export const completeRegistrationDialog = {
	open() {
		isOpen = true;
		emit();
	},
	close() {
		isOpen = false;
		emit();
	},
	subscribe(listener: () => void) {
		listeners.add(listener);
		return () => listeners.delete(listener);
	},
	getSnapshot: () => isOpen,
};

export const useIsCompleteRegistrationOpen = () =>
	useSyncExternalStore(
		completeRegistrationDialog.subscribe,
		completeRegistrationDialog.getSnapshot,
		() => false,
	);
