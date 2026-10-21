import {
	type LiveJackpot,
	useLiveJackpots,
} from "@/components/jackpot/hooks/use-live-jackpots.ts";
import type { JackpotTier } from "@/components/jackpot/jackpot-tiers.tsx";
import { useFetchEligibleJackpots } from "@/components/jackpot/queries/fetch-eligible-jackpot.ts";
import { useSession } from "@/providers/authentication/authentication.tsx";
import type { BurstModeType } from "@/schemas-types";

export type PlayerJackpot = {
	id: string;
	name: string;
	baseCurrency: string;
	optIn: boolean;
	tiers: JackpotTier[];
	burstMode?: BurstModeType;
	// The feed may still send this jackpot's tier values.
	valuesPending: boolean;
};

// A tier's live value and last win, from the feed's message for the same jackpot.
const withLiveValues = (
	tiers: readonly { name: string }[],
	live?: LiveJackpot,
): JackpotTier[] =>
	tiers.map(({ name }) => ({
		name,
		...live?.tiers.find((tier) => tier.name === name),
	}));

// The player's eligible jackpots with live values and burst mode; a visitor sees the
// brand's live jackpots, not joined, once the feed has had time to send them.
export const usePlayerJackpots = () => {
	const { session } = useSession();
	const isLoggedIn = Boolean(session?.user);
	const { data: eligible, isPending } = useFetchEligibleJackpots();
	const { jackpots: live, isWaiting, hasWaitedLongEnough } = useLiveJackpots();

	if (!isLoggedIn) {
		const jackpots: PlayerJackpot[] = live.map((jackpot) => ({
			...jackpot,
			optIn: false,
			valuesPending: false,
		}));
		return { isLoggedIn, isLoading: isWaiting, jackpots };
	}
	const jackpots: PlayerJackpot[] = (eligible?.data ?? []).map((jackpot) => {
		const liveJackpot = live.find(({ id }) => id === jackpot.id);
		return {
			id: jackpot.id,
			name: jackpot.name,
			baseCurrency: jackpot.baseCurrency,
			optIn: jackpot.optIn,
			tiers: withLiveValues(jackpot.tiers, liveJackpot),
			// The feed's burst mode is newer than the eligible list's.
			burstMode: liveJackpot?.burstMode ?? jackpot.burstMode,
			// Each jackpot waits for its own message, until the feed's wait is over.
			valuesPending: !liveJackpot && !hasWaitedLongEnough,
		};
	});
	return { isLoggedIn, isLoading: isPending, jackpots };
};
