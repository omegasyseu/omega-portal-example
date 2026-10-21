import { Progress } from "@mantine/core";
import type { BonusCard } from "@/components/bonuses/promotions-model.ts";
import { formatNumByCurrency } from "@/hooks/use-format/fomatCurrencySymbol";
import classes from "./promotions.module.css";

// How much of a Bonus's wagering requirement the player has played through.
export function WageringProgress({ bonus }: { bonus: BonusCard }) {
	return (
		<>
			<Progress
				value={bonus.progress}
				aria-label={`${bonus.planName} wagering progress`}
			/>
			<div className={classes.wagering}>
				<span>
					Wagered {formatNumByCurrency(bonus.wagered, bonus.currency)}
				</span>
				<span>
					of {formatNumByCurrency(bonus.wagerRequirement, bonus.currency)}
				</span>
			</div>
		</>
	);
}
