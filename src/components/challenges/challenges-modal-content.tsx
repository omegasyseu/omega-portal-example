import { Anchor, Skeleton, Text } from "@mantine/core";
import { IconTarget } from "@tabler/icons-react";
import { Link, useLocation } from "@tanstack/react-router";
import { ChallengeRow } from "@/components/challenges/challenge-row.tsx";
import {
	type Challenge,
	useChallenges,
} from "@/components/challenges/use-challenges.ts";
import { formatNumByCurrency } from "@/hooks/use-format/fomatCurrencySymbol";
import classes from "./challenges.module.css";

const HEADER_ICON_SIZE = 36;
const LOADING_HEIGHT = 240;

// The total of every reward, when the challenges all pay in one currency.
const WinUpTo = ({ challenges }: { challenges: Challenge[] }) => {
	const currencies = new Set(challenges.map(({ currency }) => currency));
	if (currencies.size !== 1) {
		return null;
	}
	const total = challenges.reduce(
		(sum, { awardAmount }) => sum + awardAmount,
		0,
	);
	return (
		<div className={classes.winUpTo}>
			Win up to
			<span className={classes.winUpToAmount}>
				{formatNumByCurrency(total, challenges[0].currency)}
			</span>
		</div>
	);
};

// The Challenges dialog, in the Omega Wins Daily Challenge style: every challenge with its
// reward, progress and time left, and a link to the Badges they earn.
export function ChallengesModalContent({
	hasIntro = true,
}: {
	// The icon and "Complete each challenge…" heading the dialog opens with; the game
	// page's Daily Challenges tab leaves them out.
	hasIntro?: boolean;
}) {
	const { challenges, isPending, hasFailed, retry } = useChallenges();
	const isOpenedHere = useLocation({
		select: ({ state }) => state.isDialogOpen === true,
	});

	return (
		<>
			{hasIntro ? (
				<div className={classes.header}>
					<span className={classes.headerIcon}>
						<IconTarget size={HEADER_ICON_SIZE} aria-hidden />
					</span>
					<Text className={classes.lead}>
						Complete each challenge to claim its reward.
					</Text>
				</div>
			) : null}
			{isPending ? (
				<Skeleton height={LOADING_HEIGHT} radius="lg" />
			) : hasFailed ? (
				<Text className={classes.lead} ta="center" role="alert">
					We couldn&#39;t load your challenges.{" "}
					<Anchor component="button" type="button" onClick={retry}>
						Try again
					</Anchor>
				</Text>
			) : challenges.length === 0 ? (
				<Text className={classes.lead} ta="center">
					No challenges right now. Check back soon.
				</Text>
			) : (
				<>
					<WinUpTo challenges={challenges} />
					<div className={classes.list}>
						{challenges.map((challenge) => (
							<ChallengeRow
								key={challenge.challengeUUID}
								challenge={challenge}
							/>
						))}
					</div>
				</>
			)}
			{/* Replaces the dialog's own history entry when it opened with one, so Back
			    doesn't reopen it; a dialog opened by address keeps the page's entry. */}
			<Anchor
				component={Link}
				to="/badges"
				replace={isOpenedHere}
				size="sm"
				ta="center"
			>
				View your badges
			</Anchor>
		</>
	);
}
