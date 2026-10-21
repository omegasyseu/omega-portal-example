import { Button, Progress, RingProgress, Text } from "@mantine/core";
import { IconMapPinFilled, IconStarFilled } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import {
	type EngageProgress,
	levelUpProgress,
	questProgress,
} from "@/components/engage/engage-progress.ts";
import { useFetchLevelupInfo } from "@/components/levelup/queries/fetch-levelup.ts";
import { useFetchQuestInfo } from "@/components/quest/queries/fetch-quest.ts";
import { formatNumber } from "@/hooks/use-format/formatNumber";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";
import classes from "./shell.module.css";

// The sidebar is on every page, so it checks progress less often than the Level Up
// and quest pages do.
export const SIDEBAR_REFETCH_MS = 30 * 1000;

const LEVEL_RING_SIZE = 58;
const LEVEL_RING_THICKNESS = 4;
const CAPTION_ICON_SIZE = 10;
const QUEST_ICON_SIZE = 14;
const LEVEL_BAR_HEIGHT = 8;
const QUEST_BAR_HEIGHT = 6;

type Props = {
	// Closes the sidebar when it is open as the mobile menu.
	onNavigate: () => void;
};

// The bar both widgets share: blue into neon, as on Omega Wins.
const ProgressBar = ({
	progress,
	size,
}: {
	progress: EngageProgress;
	size: number;
}) => (
	<Progress
		value={progress.percent}
		size={size}
		radius="xl"
		classNames={{ root: classes.widgetTrack, section: classes.widgetFill }}
		aria-label={`${progress.title} progress`}
	/>
);

// Level Up as on Omega Wins: the level in a ring of its progress, the plan's name over
// "Level 62", the bar between 0 and the target, and Claim when an award is waiting (a
// neon dot marks it too).
const LevelUpWidget = ({
	levelUp,
	onNavigate,
}: Props & {
	levelUp: NonNullable<ReturnType<typeof levelUpProgress>>;
}) => (
	<section
		className={`${classes.widget} ${classes.levelUpWidget}`}
		// Named "OMEGA Level Up, Level 62": the plan, then the level.
		aria-labelledby="sidebar-level-up-name sidebar-level-up"
	>
		{levelUp.hasAwardToClaim ? (
			<span className={classes.awardDot} aria-hidden />
		) : null}
		<div className={classes.levelHeader}>
			<RingProgress
				size={LEVEL_RING_SIZE}
				thickness={LEVEL_RING_THICKNESS}
				// A round cap on an empty ring would show as a stray dot.
				roundCaps={levelUp.percent > 0}
				sections={[{ value: levelUp.percent, color: "neon" }]}
				// The same track as the bars, so an empty ring still shows.
				rootColor="dark.3"
				label={
					<Text component="span" className={classes.levelNumber}>
						{levelUp.level}
					</Text>
				}
				aria-hidden
			/>
			<div className={classes.levelName}>
				<Text component="span" className={classes.levelCaption}>
					<IconStarFilled
						size={CAPTION_ICON_SIZE}
						className={classes.levelStar}
						aria-hidden
					/>
					<span id="sidebar-level-up-name" className={classes.levelCaptionText}>
						{levelUp.title}
					</span>
				</Text>
				<Text
					component="h2"
					id="sidebar-level-up"
					className={classes.levelTitle}
				>
					Level {levelUp.level}
				</Text>
			</div>
		</div>
		<div>
			<div className={classes.levelEnds} aria-hidden>
				<span>0</span>
				<span>{levelUp.targetLabel}</span>
			</div>
			<ProgressBar progress={levelUp} size={LEVEL_BAR_HEIGHT} />
		</div>
		{levelUp.hasAwardToClaim ? (
			<Button
				component={Link}
				to="/levelup"
				fullWidth
				color="cta"
				onClick={onNavigate}
			>
				Claim
			</Button>
		) : null}
	</section>
);

// The quest as on Omega Wins: its name and points, how far through the level, and
// Explore to the quest map.
const QuestWidget = ({
	quest,
	onNavigate,
}: Props & { quest: NonNullable<ReturnType<typeof questProgress>> }) => (
	<section className={classes.widget} aria-labelledby="sidebar-quest">
		<div className={classes.questHeader}>
			<IconMapPinFilled
				size={QUEST_ICON_SIZE}
				className={classes.questIcon}
				aria-hidden
			/>
			<Text
				component="h2"
				id="sidebar-quest"
				className={classes.questTitle}
				// The full name on hover, since a long one is cut short.
				title={quest.title}
			>
				{quest.title}
			</Text>
			<Text component="span" className={classes.questPoints}>
				{formatNumber(quest.points)} Quest Points
			</Text>
		</div>
		<Text className={classes.questMeta}>
			Progress to next level: {quest.progressLabel}
		</Text>
		<ProgressBar progress={quest} size={QUEST_BAR_HEIGHT} />
		<Button
			component={Link}
			to="/quest"
			fullWidth
			color="cta"
			onClick={onNavigate}
		>
			Explore
		</Button>
	</section>
);

// Level Up and Quest progress for a logged-in player, at the top of the sidebar. A
// widget whose feature the Brand hides or IPS doesn't run (or whose request fails) isn't
// shown.
export function EngageWidgets({ onNavigate }: Props) {
	const { engageFeatures } = useBrandContent();
	const { data: levelUpData } = useFetchLevelupInfo({
		refetchInterval: SIDEBAR_REFETCH_MS,
		isEnabled: engageFeatures.levelUp,
	});
	const { data: questData } = useFetchQuestInfo({
		refetchInterval: SIDEBAR_REFETCH_MS,
		isEnabled: engageFeatures.quest,
	});
	// The query keeps its last data when switched off, so the Brand decides.
	const levelUp = engageFeatures.levelUp
		? levelUpProgress(levelUpData?.data)
		: undefined;
	const quest = engageFeatures.quest
		? questProgress(questData?.data)
		: undefined;

	if (!levelUp && !quest) {
		return null;
	}

	return (
		<div className={classes.widgets}>
			{levelUp ? (
				<LevelUpWidget levelUp={levelUp} onNavigate={onNavigate} />
			) : null}
			{quest ? <QuestWidget quest={quest} onNavigate={onNavigate} /> : null}
		</div>
	);
}
