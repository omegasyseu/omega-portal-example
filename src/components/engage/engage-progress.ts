// What the sidebar's Level Up and Quest widgets show, read from a /levelup or /quest
// response. Kept free of React so the rules can be tested on their own.

type ProgressEntry = {
	title: string;
	currentLevel: number;
	progress: number;
	// The API sends the target as a string, such as "10".
	target: string;
	questPointBalance: number;
	// Level Up only: awards reached but not yet claimed.
	claimableAwards?: readonly unknown[];
};

export type EngageProgress = {
	title: string;
	level: number;
	// How far the player is through the current level, 0 to 100.
	percent: number;
	progressLabel: string;
	// The level's end point, under the bar's right end ("10").
	targetLabel: string;
};

const FULL = 100;

// How far progress is towards a target sent as a string, 0 to 100.
export const progressPercent = (progress: number, target: string) => {
	const goal = Number(target);
	if (!Number.isFinite(goal) || goal <= 0) {
		return 0;
	}
	return Math.min(FULL, Math.max(0, Math.round((FULL * progress) / goal)));
};

// A player has one Level Up and one quest; the widgets show the first entry.
const toProgress = (entry: ProgressEntry): EngageProgress => ({
	title: entry.title,
	level: entry.currentLevel,
	percent: progressPercent(entry.progress, entry.target),
	progressLabel: `${entry.progress} / ${entry.target}`,
	targetLabel: entry.target,
});

export const levelUpProgress = (
	entries: readonly ProgressEntry[] | undefined,
): (EngageProgress & { hasAwardToClaim: boolean }) | null => {
	const entry = entries?.[0];
	return entry
		? {
				...toProgress(entry),
				// The list can hold empty slots, which aren't awards.
				hasAwardToClaim: (entry.claimableAwards ?? []).some(Boolean),
			}
		: null;
};

export const questProgress = (
	entries: readonly ProgressEntry[] | undefined,
): (EngageProgress & { points: number }) | null => {
	const entry = entries?.[0];
	return entry
		? { ...toProgress(entry), points: entry.questPointBalance }
		: null;
};
