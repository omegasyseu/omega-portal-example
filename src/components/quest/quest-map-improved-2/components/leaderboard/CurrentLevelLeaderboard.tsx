import {
	Badge,
	Box,
	Divider,
	Group,
	Skeleton,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import { useMemo } from "react";
import { useQuestProgressLeaderboard } from "@/components/quest/queries/fetch-quest";
import type { QuestLeaderboardEntryResponse } from "@/server/AMS/quest-leaderboard";
import { useQuestById } from "../../context";
import styles from "../LeaderboardPanel.module.css";
import { getRankIcon } from "./LeaderboardUtils";

interface CurrentLevelLeaderboardProps {
	configurationId: string;
}

interface LeaderboardResponse {
	data?: QuestLeaderboardEntryResponse[];
	[key: string]: unknown;
}

const CurrentLevelLeaderboard = ({
	configurationId,
}: CurrentLevelLeaderboardProps) => {
	const currentQuest = useQuestById(configurationId);
	const currentUserLevel = currentQuest?.currentLevel || 0;
	const maxLevel = currentQuest?.maxLevel || 0;

	// Display the level the player is working towards (next level)
	// Unless they're at max level, then show max level
	const displayLevel =
		currentUserLevel < maxLevel ? currentUserLevel + 1 : maxLevel;

	const { data, isLoading } = useQuestProgressLeaderboard(
		configurationId,
		currentUserLevel,
	);

	// Process the leaderboard data
	const processedLeaderboardData = useMemo(() => {
		if (!data || !currentQuest) return [];

		// Get the target amount for the current level
		const targetAmount = Number(currentQuest.target) || 0;

		// Extract the array from the response - it might be in data.data or just data
		const leaderboardArray = Array.isArray(data)
			? data
			: (data as LeaderboardResponse).data || [];

		// Process the leaderboard entries
		return leaderboardArray.map((entry, index) => {
			// Calculate progress percentage based on target; null when the
			// progress amount or target is unavailable (rendered as N/A)
			const progressPercentage =
				typeof entry.progress === "number" && targetAmount > 0
					? Math.min(Math.round((entry.progress / targetAmount) * 100), 100)
					: null;

			return {
				rank: index + 1,
				player: entry.userId,
				progress: progressPercentage,
			};
		});
	}, [data, currentQuest]);

	// Get current user's progress from questInfo
	const currentUserProgress = currentQuest?.percentage;

	if (isLoading) {
		return (
			<Stack gap="sm">
				<Skeleton height={30} width={150} />
				{[1, 2, 3, 4, 5].map((i) => (
					<Skeleton key={i} height={60} />
				))}
			</Stack>
		);
	}

	return (
		<Stack gap="sm">
			<Badge variant="light" className={styles.levelIndicator}>
				Level {displayLevel} Competition
			</Badge>

			{processedLeaderboardData.length > 0 ? (
				processedLeaderboardData.map((entry) => (
					<Box
						key={entry.rank}
						className={`${styles.leaderboardEntry} ${
							entry.rank <= 3 ? styles[`rank${entry.rank}`] : ""
						}`}
					>
						<Group justify="space-between" wrap="nowrap">
							<Group gap="md" style={{ minWidth: 0, flex: 1 }}>
								<Box className={styles.rankContainer}>
									{getRankIcon(entry.rank, styles)}
								</Box>
								<Tooltip label={entry.player} position="top" withArrow>
									<Box style={{ minWidth: 0, flex: 1 }}>
										<Text
											size="sm"
											fw={600}
											c="dark.0"
											className={styles.playerName}
											style={{
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
												display: "block",
											}}
										>
											{entry.player}
										</Text>
									</Box>
								</Tooltip>
							</Group>
							<Stack gap={0} align="end" style={{ flexShrink: 0 }}>
								<Group gap="xs">
									<Text size="sm" fw={700} c="gold" className={styles.score}>
										{entry.progress !== null ? `${entry.progress}%` : "N/A"}
									</Text>
								</Group>
								<Text size="xs" c="dimmed">
									progress
								</Text>
							</Stack>
						</Group>
					</Box>
				))
			) : (
				<Text size="sm" c="dimmed" ta="center" py="md">
					No leaderboard data available
				</Text>
			)}

			<Divider className={styles.divider} />

			{/* Your Current Progress */}
			{currentUserProgress !== undefined && (
				<Box className={styles.yourPosition}>
					<Group justify="space-between" align="center">
						<Stack gap={0}>
							<Text size="xs" c="dimmed" tt="uppercase" fw={500}>
								Your Progress
							</Text>
							<Text size="md" fw={600} c="dark.0">
								{currentUserProgress}% Completed
							</Text>
						</Stack>
					</Group>
				</Box>
			)}
		</Stack>
	);
};

export default CurrentLevelLeaderboard;
