import { Badge, Button, Skeleton, Text, Title } from "@mantine/core";
import { IconGift } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { BonusDetailsModal } from "@/components/bonuses/bonus-details-modal.tsx";
import { ExpiredBonuses } from "@/components/bonuses/expired-bonuses.tsx";
import { LoadError } from "@/components/bonuses/load-error.tsx";
import {
	type BonusCard,
	buildPromotions,
	defaultHistoryWindow,
	type HistoryWindow,
} from "@/components/bonuses/promotions-model.ts";
import { useGetActiveBonuses } from "@/components/bonuses/queries/get-active-bonuses.ts";
import { useGetBonusesHistory } from "@/components/bonuses/queries/get-bonuses-history.ts";
import { RewardCard } from "@/components/bonuses/reward-card.tsx";
import { useShellNavigation } from "@/layout/shell/use-shell-navigation.ts";
import classes from "./promotions.module.css";

const SECTION_ICON_SIZE = 24;
const LOADING_HEIGHT = 280;

// No active Bonus yet: point the player at the payment that can award one.
const NoRewards = () => {
	const { callToAction } = useShellNavigation();
	return (
		<div className={classes.empty}>
			<Text className={classes.lead}>
				You have no active rewards. Bonuses you pick up with a payment show up
				here.
			</Text>
			<Button component={Link} to={callToAction.to}>
				{callToAction.label}
			</Button>
		</div>
	);
};

const MyRewards = ({
	rewards,
	isLoading,
	error,
	onView,
}: {
	rewards: BonusCard[];
	isLoading: boolean;
	// Set when the active Bonuses failed to load; retries the call.
	error?: { onRetry: () => void };
	onView: (bonus: BonusCard) => void;
}) => (
	<section className={classes.section} aria-labelledby="my-rewards-title">
		<Title order={2} id="my-rewards-title" className={classes.sectionTitle}>
			<IconGift
				size={SECTION_ICON_SIZE}
				className={classes.sectionIcon}
				aria-hidden
			/>
			My Rewards
			{rewards.length > 0 ? (
				<Badge color="neon" c="dark.9" circle>
					{rewards.length}
				</Badge>
			) : null}
		</Title>
		{isLoading ? (
			<Skeleton height={LOADING_HEIGHT} radius="lg" />
		) : error ? (
			<LoadError onRetry={error.onRetry} />
		) : rewards.length === 0 ? (
			<NoRewards />
		) : (
			<ul className={classes.cards}>
				{rewards.map((bonus) => (
					<li key={bonus.id}>
						<RewardCard bonus={bonus} onView={() => onView(bonus)} />
					</li>
				))}
			</ul>
		)}
	</section>
);

// The Promotions page, as on Omega Wins: the player's active Bonuses as My Rewards cards,
// each opening its details, then the Expired Bonuses of the chosen dates.
export function PromotionsPage() {
	const [historyWindow, setHistoryWindow] = useState<HistoryWindow>(() =>
		defaultHistoryWindow(new Date()),
	);
	const [viewing, setViewing] = useState<BonusCard>();
	const active = useGetActiveBonuses();
	const history = useGetBonusesHistory({
		startDate: historyWindow.from,
		endDate: historyWindow.to,
	});
	const { rewards, expired } = buildPromotions({
		active: active.data?.bonuses,
		history: history.data?.bonuses,
	});

	return (
		<div className={classes.page}>
			<Title order={1} className={classes.pageTitle}>
				Promotions
			</Title>
			<MyRewards
				rewards={rewards}
				isLoading={active.isPending}
				error={
					// A failed refetch keeps the cached Bonuses; only an empty, failed load
					// shows the error.
					active.isError && !active.data
						? { onRetry: () => void active.refetch() }
						: undefined
				}
				onView={setViewing}
			/>
			<ExpiredBonuses
				bonuses={expired}
				isLoading={history.isPending}
				error={
					history.isError && !history.data
						? { onRetry: () => void history.refetch() }
						: undefined
				}
				historyWindow={historyWindow}
				onHistoryWindowChange={setHistoryWindow}
			/>
			<BonusDetailsModal
				bonus={viewing}
				onClose={() => setViewing(undefined)}
			/>
		</div>
	);
}
