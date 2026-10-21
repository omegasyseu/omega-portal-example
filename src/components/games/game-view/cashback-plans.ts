import type { z } from "zod";
import type {
	CashbackBalances,
	cashbackschemaType,
} from "@/schemas-types/cashback";

export type CashbackPlan = NonNullable<z.infer<typeof CashbackBalances>>;

// The plans the game page's Cashback card shows: instant cashback that is still running.
export const runningInstantPlans = (
	data: Pick<cashbackschemaType, "planBalances"> | undefined,
): CashbackPlan[] =>
	(data?.planBalances ?? []).filter(
		(plan): plan is CashbackPlan =>
			plan?.cashbackPlanType === "INSTANT" && plan?.planStatus === "RUNNING",
	);

export const isPlanLimitReached = (plan: CashbackPlan) => {
	const limitPerPlayer = plan.limitPerPlayer ?? 0;
	return limitPerPlayer > 0 && (plan.limitUsed ?? 0) >= limitPerPlayer;
};

// Redeem opens from the plan's minimum, when the plan lets the player redeem and its
// limit isn't used up.
export const canClaimPlan = (plan: CashbackPlan) => {
	const claimable = plan.cashbackPlayerAvailable ?? 0;
	return (
		plan.isPlayerRedeemable !== false &&
		claimable > 0 &&
		claimable >= (plan.minimumClaimAmount ?? 0) &&
		!isPlanLimitReached(plan)
	);
};

export const hasCashbackToClaim = (
	data: Pick<cashbackschemaType, "planBalances"> | undefined,
) => runningInstantPlans(data).some(canClaimPlan);
