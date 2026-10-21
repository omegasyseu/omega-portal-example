import { Anchor, Group, Image, Loader, Radio, Text } from "@mantine/core";
import classes from "./payments.module.css";

type BonusPlan = {
	bonusPlanId: string;
	bonusPlanName: string;
	imageUrl?: string | null;
};

// Where the check of the amount's plans stands: no amount yet, one that can't be
// deposited (not above 0, or over the daily limit), being checked, failed, or done.
export type BonusCheck =
	| "no-amount"
	| "invalid-amount"
	| "checking"
	| "failed"
	| "ready";

type Props = {
	// The plans the amount is eligible for, once checked.
	plans?: readonly BonusPlan[];
	// The picked plan's id; empty for no bonus.
	selectedId: string;
	onSelect: (bonusPlanId: string) => void;
	check: BonusCheck;
	onRetry: () => void;
};

// The radio value for depositing without a bonus; the form keeps it as "".
const NO_BONUS = "none";
const NO_BONUS_ART = "/backgrounds/deposit-without-bonus.avif";
const BONUS_FALLBACK_ART = "/backgrounds/rewards-promo.avif";

// Where the check for this amount's plans stands, under the choices.
const CheckStatus = ({
	plans,
	check,
	onRetry,
}: Pick<Props, "plans" | "check" | "onRetry">) => {
	if (check === "no-amount") {
		return (
			<Text className={classes.note}>
				Enter an amount to see the bonuses you can claim with it.
			</Text>
		);
	}
	if (check === "invalid-amount") {
		return (
			<Text className={classes.note}>
				Bonuses are checked for an amount above 0 and within your daily limit.
			</Text>
		);
	}
	if (check === "checking") {
		return (
			<Group gap="xs">
				<Loader size="xs" aria-hidden />
				<Text className={classes.note}>Checking bonuses for this amount…</Text>
			</Group>
		);
	}
	if (check === "failed") {
		return (
			<Text className={classes.note}>
				We couldn&#39;t check bonuses for this amount. You can still deposit
				without one.{" "}
				<Anchor component="button" type="button" size="xs" onClick={onRetry}>
					Try again
				</Anchor>
			</Text>
		);
	}
	return plans?.length ? null : (
		<Text className={classes.note}>No bonuses for this amount.</Text>
	);
};

// The bonus to claim with the deposit: none, or one of the plans this amount is
// eligible for, as cards. Missing or broken plan images use quiet rewards art.
export function BonusPlanPicker({
	plans,
	selectedId,
	onSelect,
	check,
	onRetry,
}: Props) {
	return (
		<Radio.Group
			label="Bonus"
			value={selectedId || NO_BONUS}
			onChange={(value) => onSelect(value === NO_BONUS ? "" : value)}
			classNames={{ label: classes.sectionLabel }}
		>
			<div className={classes.plans}>
				<Radio.Card value={NO_BONUS} className={classes.plan}>
					<Image
						src={NO_BONUS_ART}
						alt=""
						h="100%"
						className={classes.planArt}
					/>
					<Radio.Indicator className={classes.planIndicator} />
					<Text component="span" className={classes.planName}>
						Deposit without a bonus
					</Text>
				</Radio.Card>
				{plans?.map((plan) => (
					<Radio.Card
						key={plan.bonusPlanId}
						value={plan.bonusPlanId}
						className={classes.plan}
						title={plan.bonusPlanName}
					>
						<Image
							src={plan.imageUrl || BONUS_FALLBACK_ART}
							fallbackSrc={BONUS_FALLBACK_ART}
							alt=""
							h="100%"
							className={classes.planArt}
						/>
						<Radio.Indicator className={classes.planIndicator} />
						<Text component="span" lineClamp={2} className={classes.planName}>
							{plan.bonusPlanName}
						</Text>
					</Radio.Card>
				))}
			</div>
			<div className={classes.planStatus} aria-live="polite">
				<CheckStatus plans={plans} check={check} onRetry={onRetry} />
			</div>
		</Radio.Group>
	);
}
