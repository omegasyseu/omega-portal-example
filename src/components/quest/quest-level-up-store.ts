import { useSyncExternalStore } from "react";

export interface QuestLevelUpData {
	questId: string;
	level: number;
}

let currentData: QuestLevelUpData | null = null;
const listeners = new Set<() => void>();

function emitChange() {
	for (const listener of listeners) {
		listener();
	}
}

export const questLevelUpStore = {
	open(data: QuestLevelUpData) {
		currentData = data;
		emitChange();
	},
	close() {
		currentData = null;
		emitChange();
	},
	getSnapshot(): QuestLevelUpData | null {
		return currentData;
	},
	subscribe(listener: () => void) {
		listeners.add(listener);
		return () => listeners.delete(listener);
	},
};

export function useQuestLevelUp() {
	return useSyncExternalStore(
		questLevelUpStore.subscribe,
		questLevelUpStore.getSnapshot,
		() => null,
	);
}
