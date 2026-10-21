import type { z } from "zod";
import type { challengerData } from "@/schemas-types/challenger";
import { useFetchChallenges } from "@/server/IPS/challenges/get-challenges.ts";

export type Challenge = NonNullable<z.infer<typeof challengerData>>;

const COMPLETE = 100;

// Done once its progress reaches the target; the player can then claim the reward.
export const isComplete = (challenge: Challenge) =>
	challenge.percentage >= COMPLETE;

// The player's challenges, without the empty entries the API can return. `hasFailed`
// tells a failed request apart from having no challenges; trying again counts as loading.
export const useChallenges = () => {
	const { data, isPending, isError, isFetching, refetch } =
		useFetchChallenges();
	const hasNoData = data === undefined;
	const challenges = (data?.data ?? []).filter(
		(challenge): challenge is Challenge => !!challenge,
	);
	return {
		challenges,
		isPending: isPending || (isError && isFetching && hasNoData),
		hasFailed: isError && !isFetching && hasNoData,
		retry: () => refetch(),
	};
};
