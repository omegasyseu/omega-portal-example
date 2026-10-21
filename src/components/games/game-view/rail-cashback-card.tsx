import { Button, Progress, Text } from "@mantine/core";
import { getCurrencyFromMap } from "@/hooks/use-format/fomatCurrencySymbol";
import { formatFiat } from "@/hooks/use-format/formatFiat";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { useGetCashback } from "@/server/IPS/user/get-user-cashback-balance.ts";
import { useRedeemCashback } from "@/server/IPS/user/redeem-cashback.tsx";
import { CountUp } from "@/ui/count-up";
import {
	type CashbackPlan,
	canClaimPlan,
	isPlanLimitReached,
	runningInstantPlans,
} from "./cashback-plans.ts";
import classes from "./game-view.module.css";

const MAX_PERCENT = 100;
const COUNT_UP_SECONDS = 3;

// One running instant-cashback plan: what the player has built up, how much of the
// plan's limit they've used, and Redeem once there's something to claim.
const PlanBalance = ({ plan }: { plan: CashbackPlan }) => {
	const { mutate, isPending } = useRedeemCashback();
	const symbol = getCurrencyFromMap(plan.currency ?? "");
	const money = (value: number) => `${symbol}${formatFiat(value)}`;
	const available = plan.cashbackAvailable ?? 0;
	const amount = available > 0 ? available : (plan.cashbackAccumulated ?? 0);
	const limitUsed = plan.limitUsed ?? 0;
	const limitPerPlayer = plan.limitPerPlayer ?? 0;
	const minimumClaim = plan.minimumClaimAmount ?? 0;
	const limitReached = isPlanLimitReached(plan);
	const canClaim = canClaimPlan(plan);

	return (
		<div className={classes.cashbackPlan}>
			<Text className={classes.cardText} truncate title={plan.cashbackPlanName}>
				{plan.cashbackPlanName}
			</Text>
			<Text className={classes.cashbackAmount}>
				<CountUp
					end={amount}
					duration={COUNT_UP_SECONDS}
					separator=","
					decimal="."
					decimals={2}
					preserveValue
					prefix={symbol}
				/>
			</Text>
			{limitPerPlayer > 0 ? (
				<>
					<Progress
						value={Math.min(
							MAX_PERCENT,
							(MAX_PERCENT * limitUsed) / limitPerPlayer,
						)}
						color={limitReached ? "neon" : "gold"}
						size="sm"
						radius="xl"
						className={classes.cashbackBar}
						aria-label="Cashback limit used"
					/>
					<Text className={classes.cashbackMeta}>
						{money(limitUsed)} of {money(limitPerPlayer)} limit used.
					</Text>
					{minimumClaim > 0 ? (
						<Text className={classes.cashbackMeta}>
							Redeem from {money(minimumClaim)}.
						</Text>
					) : null}
				</>
			) : null}
			{canClaim ? (
				<Button
					loading={isPending}
					onClick={() => mutate({ cashbackPlanId: plan.cashbackPlanId })}
				>
					Redeem
				</Button>
			) : null}
			{limitReached ? (
				<Text className={classes.cardText}>
					You&#39;ve reached this plan&#39;s cashback limit.
				</Text>
			) : null}
		</div>
	);
};

// The rail's Cashback card: the player's running instant-cashback plans. Hidden when
// there are none, or when logged out.
export function RailCashbackCard() {
	const { session } = useSession();
	const { data } = useGetCashback();
	const plans = runningInstantPlans(data);

	// The query keeps its last data once logged out, so the session decides.
	if (!session?.user?.sessionKey || plans.length === 0) {
		return null;
	}

	return (
		<section className={classes.card} aria-labelledby="rail-cashback">
			<Text component="h2" id="rail-cashback" className={classes.cardTitle}>
				Cashback
			</Text>
			{plans.map((plan) => (
				<PlanBalance key={plan.cashbackPlanId} plan={plan} />
			))}
		</section>
	);
}
