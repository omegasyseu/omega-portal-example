import {
	Alert,
	Box,
	Divider,
	Group,
	Loader,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useQuestLeaderboard } from "@/components/quest/queries/fetch-quest";
import type { QuestLeaderboardEntryResponse } from "@/server/AMS/quest-leaderboard";
import { useQuestById } from "../../context/QuestInfoProvider";
import styles from "../LeaderboardPanel.module.css";
import { getRankIcon } from "./LeaderboardUtils";

interface OverallQuestLeaderboardProps {
	configurationId: string;
}

const OverallQuestLeaderboard = ({
	configurationId,
}: OverallQuestLeaderboardProps) => {
	const { data, isLoading, error } = useQuestLeaderboard(configurationId);
	const leaderboard: QuestLeaderboardEntryResponse[] = data?.data ?? [];
	const currentQuest = useQuestById(configurationId);
	const currentUserLevel = currentQuest?.currentLevel;

	if (isLoading) {
		return (
			<Box p="xl" ta="center">
				<Loader size="sm" />
			</Box>
		);
	}

	if (error) {
		return (
			<Alert
				icon={<IconAlertCircle size={16} />}
				color="danger"
				variant="light"
			>
				Failed to load leaderboard
			</Alert>
		);
	}

	return (
		<Stack gap="sm">
			{leaderboard.map((entry, index) => {
				const rank = index + 1;
				return (
					<Box
						// biome-ignore lint/suspicious/noArrayIndexKey: index disambiguates repeated users
						key={`${entry.userId}-${index}`}
						className={`${styles.leaderboardEntry} ${
							rank <= 3 ? styles[`rank${rank}`] : ""
						}`}
					>
						<Group justify="space-between" wrap="nowrap">
							<Group gap="md" style={{ minWidth: 0, flex: 1 }}>
								<Box className={styles.rankContainer}>
									{getRankIcon(rank, styles)}
								</Box>
								<Tooltip label={entry.userId} position="top" withArrow>
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
											{entry.userId}
										</Text>
									</Box>
								</Tooltip>
							</Group>
							<Box style={{ flexShrink: 0 }}>
								<Text size="sm" fw={700} c="gold" className={styles.score}>
									{typeof entry.level === "number"
										? `Level ${entry.level}`
										: "N/A"}
								</Text>
							</Box>
						</Group>
					</Box>
				);
			})}

			<Divider className={styles.divider} />

			{/* Your Current Level */}
			{currentUserLevel !== undefined && (
				<Box className={styles.yourPosition}>
					<Group justify="space-between" align="center">
						<Stack gap={0}>
							<Text size="xs" c="dimmed" tt="uppercase" fw={500}>
								Your Progress
							</Text>
							<Text size="md" fw={600} c="dark.0">
								{currentUserLevel === 0
									? "Just starting"
									: `Currently on Level ${currentUserLevel}`}
							</Text>
						</Stack>
					</Group>
				</Box>
			)}
		</Stack>
	);
};

export default OverallQuestLeaderboard;
