import { Badge, Button, Group, Text } from "@mantine/core";
import { useState } from "react";
import { useCancelBonus } from "@/components/bonuses/hooks/cancel-bonus.tsx";
import type { BonusCard } from "@/components/bonuses/promotions-model.ts";
import { WageringProgress } from "@/components/bonuses/wagering-progress.tsx";
import { PortalModal } from "@/components/route-modal";
import { formatNumByCurrency } from "@/hooks/use-format/fomatCurrencySymbol";
import classes from "./promotions.module.css";

const DETAILS_WIDTH = 480;

const GameList = ({ label, games }: { label: string; games: string[] }) => (
	<>
		<Text className={classes.sectionTitle} component="h3" fz="md">
			{label}
		</Text>
		<ul className={classes.games} aria-label={label}>
			{games.map((game) => (
				<li key={game}>
					<Badge variant="default">{game}</Badge>
				</li>
			))}
		</ul>
	</>
);

// Which games count towards the wagering: only the restricted ones when there are some,
// never the excluded ones.
const GameRules = ({ bonus }: { bonus: BonusCard }) => {
	if (bonus.restrictedGames.length === 0 && bonus.excludedGames.length === 0) {
		return (
			<Text className={classes.lead}>Every game counts towards wagering.</Text>
		);
	}
	return (
		<>
			{bonus.restrictedGames.length > 0 ? (
				<GameList label="Restricted games" games={bonus.restrictedGames} />
			) : null}
			{bonus.excludedGames.length > 0 ? (
				<GameList label="Excluded games" games={bonus.excludedGames} />
			) : null}
		</>
	);
};

type Props = {
	bonus?: BonusCard;
	onClose: () => void;
};

// A Bonus's details, its game rules and, while it's active, Cancel; opened by View Promotion.
// Canceling refreshes My Rewards and the Expired list, then closes the dialog.
export function BonusDetailsModal({ bonus, onClose }: Props) {
	return (
		<PortalModal
			opened={Boolean(bonus)}
			onClose={onClose}
			size={DETAILS_WIDTH}
			title={bonus?.planName}
		>
			{bonus ? (
				<>
					<dl className={classes.details}>
						<dt>Amount</dt>
						<dd>{formatNumByCurrency(bonus.amount, bonus.currency)}</dd>
						<dt>Status</dt>
						<dd>{bonus.status}</dd>
						<dt>Started</dt>
						<dd>{bonus.triggered}</dd>
						<dt>Expires</dt>
						<dd>{bonus.expires}</dd>
					</dl>
					<WageringProgress bonus={bonus} />
					<GameRules bonus={bonus} />
					{bonus.canCancel ? (
						<CancelBonus bonus={bonus} onCanceled={onClose} />
					) : null}
				</>
			) : null}
		</PortalModal>
	);
}

// Canceling forfeits the Bonus, so it asks once more before calling the API.
const CancelBonus = ({
	bonus,
	onCanceled,
}: {
	bonus: BonusCard;
	onCanceled: () => void;
}) => {
	const cancelBonus = useCancelBonus();
	const [isConfirming, setIsConfirming] = useState(false);

	if (!isConfirming) {
		return (
			<Button
				color="danger"
				variant="light"
				onClick={() => setIsConfirming(true)}
			>
				Cancel Bonus
			</Button>
		);
	}
	return (
		<div className={classes.confirm}>
			<Text className={classes.lead}>
				Cancel {bonus.planName}? You lose the bonus amount and its wagering
				progress.
			</Text>
			<Group grow>
				<Button variant="default" onClick={() => setIsConfirming(false)}>
					Keep Bonus
				</Button>
				<Button
					color="danger"
					loading={cancelBonus.isPending}
					onClick={() =>
						cancelBonus.mutate(
							{ bonusId: `${bonus.id}` },
							{ onSuccess: onCanceled },
						)
					}
				>
					Cancel Bonus
				</Button>
			</Group>
		</div>
	);
};
