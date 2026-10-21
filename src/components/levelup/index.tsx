import { Progress, Skeleton, Text, Title } from "@mantine/core";
import type { z } from "zod";
import engage from "@/components/engage/engage.module.css";
import { progressPercent } from "@/components/engage/engage-progress.ts";
import ClaimableAwardsTable from "@/components/levelup/components/claimable-awards.tsx";
import RedeemAwards from "@/components/levelup/components/table.tsx";
import classes from "@/components/levelup/levelup-page.module.css";
import { useFetchLevelupInfo } from "@/components/levelup/queries/fetch-levelup.ts";
import { getCurrencyFromMap } from "@/hooks/use-format/fomatCurrencySymbol";
import { formatFiat } from "@/hooks/use-format/formatFiat";
import type { LevelupData } from "@/schemas-types/levelup";

type LevelUp = z.infer<typeof LevelupData>;

const LOADING_HEIGHT = 200;
const FULL = 100;

const awardText = (levelUp: LevelUp) =>
	levelUp.awardType === "FREE_SPINS"
		? `${levelUp.awardAmount} free spins`
		: `${getCurrencyFromMap(levelUp.currency)}${formatFiat(levelUp.awardAmount)} bonus`;

// The player's level, progress to the next one and what reaching it pays. As before,
// progress equal to the target means the player is at the top level.
const LevelCard = ({ levelUp }: { levelUp: LevelUp }) => {
	const isTopLevel = levelUp.progress === Number(levelUp.target);

	return (
		<section
			className={engage.panel}
			aria-labelledby={`level-${levelUp.configurationId}`}
		>
			<div className={classes.levelRow}>
				<div>
					<Text className={classes.levelName}>{levelUp.title}</Text>
					<Title
						order={2}
						id={`level-${levelUp.configurationId}`}
						className={classes.level}
					>
						Level {levelUp.currentLevel}
					</Title>
				</div>
				<Text className={classes.count}>
					{levelUp.progress} / {levelUp.target}
				</Text>
			</div>
			<Progress
				value={
					isTopLevel ? FULL : progressPercent(levelUp.progress, levelUp.target)
				}
				color="neon"
				size="lg"
				radius="xl"
				className={classes.bar}
				aria-label="Progress to the next level"
			/>
			{isTopLevel ? (
				<Text className={engage.lead}>You've reached the top level.</Text>
			) : (
				<dl className={classes.facts}>
					<div>
						<dt>Next award</dt>
						<dd>{awardText(levelUp)}</dd>
					</div>
					<div>
						<dt>Min. wager</dt>
						<dd>
							{getCurrencyFromMap(levelUp.currency)}
							{formatFiat(levelUp.minWager)}
						</dd>
					</div>
				</dl>
			)}
		</section>
	);
};

const LevelupView = () => {
	const { data: levelupInfo, isLoading } = useFetchLevelupInfo({
		includeRedeemedAwards: true,
	});
	const levelUps = levelupInfo?.data ?? [];

	return (
		<div className={engage.page}>
			<div>
				<Title order={1} className={engage.title}>
					Level Up
				</Title>
				<Text className={engage.lead}>
					Wager to climb levels and claim an award at each one.
				</Text>
			</div>
			{isLoading ? <Skeleton height={LOADING_HEIGHT} radius="lg" /> : null}
			{!isLoading && levelUps.length === 0 ? (
				<Text className={engage.empty}>
					Level Up isn't running right now. Check back soon.
				</Text>
			) : null}
			{levelUps.map((levelUp) => (
				<div key={levelUp.configurationId} className={classes.stack}>
					<LevelCard levelUp={levelUp} />
					{levelUp.claimableAwards ? (
						<section
							className={engage.panel}
							aria-labelledby={`claimable-${levelUp.configurationId}`}
						>
							<Title
								order={2}
								id={`claimable-${levelUp.configurationId}`}
								className={engage.panelTitle}
							>
								Awards to claim
							</Title>
							<ClaimableAwardsTable
								levelUpUUID={levelUp.levelUpUUID}
								claimableAwards={levelUp.claimableAwards}
							/>
						</section>
					) : null}
					{levelUp.redeemedAwards ? (
						<section
							className={engage.panel}
							aria-labelledby={`redeemed-${levelUp.configurationId}`}
						>
							<Title
								order={2}
								id={`redeemed-${levelUp.configurationId}`}
								className={engage.panelTitle}
							>
								Claimed awards
							</Title>
							<RedeemAwards redeemedAwards={levelUp.redeemedAwards} />
						</section>
					) : null}
				</div>
			))}
		</div>
	);
};

export default LevelupView;
