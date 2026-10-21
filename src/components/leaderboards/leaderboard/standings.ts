// A leaderboard's standings as the page shows them: the top three on a podium, everyone
// else in a list below. Kept free of React so the rule can be tested on its own.

export type Standing = {
	rank: number;
	username: string;
	wageringInPeriod: number;
	prize: number;
};

const PODIUM_PLACES = 3;

export const splitStandings = <T extends Standing>(rankings: readonly T[]) => {
	// Not toSorted: Vite's default browser targets include Firefox versions without it.
	const byRank = [...rankings].sort((a, b) => a.rank - b.rank);
	return {
		podium: byRank.slice(0, PODIUM_PLACES),
		rest: byRank.slice(PODIUM_PLACES),
	};
};
