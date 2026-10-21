import { Button, Text, Title } from "@mantine/core";
import type { BonusCard } from "@/components/bonuses/promotions-model.ts";
import { WageringProgress } from "@/components/bonuses/wagering-progress.tsx";
import { formatNumByCurrency } from "@/hooks/use-format/fomatCurrencySymbol";
import classes from "./promotions.module.css";

type Props = {
	bonus: BonusCard;
	onView: () => void;
};

// A My Rewards card: the plan, its amount, how much is wagered and when it expires.
// Bonuses have no image, so every card shows the same brand art.
export function RewardCard({ bonus, onView }: Props) {
	const titleId = `reward-${bonus.id}`;
	return (
		<article className={classes.card} aria-labelledby={titleId}>
			<div className={classes.cardArt} aria-hidden />
			<div className={classes.cardBody}>
				<Title order={3} id={titleId} className={classes.cardTitle}>
					{bonus.planName}
				</Title>
				<Text className={classes.amount}>
					{formatNumByCurrency(bonus.amount, bonus.currency)}
				</Text>
				<WageringProgress bonus={bonus} />
				<Text className={classes.expiry}>Expires {bonus.expires}</Text>
				<Button
					variant="default"
					onClick={onView}
					className={classes.cardAction}
					aria-label={`View Promotion: ${bonus.planName}`}
				>
					View Promotion
				</Button>
			</div>
		</article>
	);
}
