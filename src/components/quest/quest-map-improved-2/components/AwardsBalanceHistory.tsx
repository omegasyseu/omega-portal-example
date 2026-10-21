import { Badge, Box, Group, Stack, Text } from "@mantine/core";
import {
	IconCoin,
	IconDiamond,
	IconRefresh,
	IconTrophy,
} from "@tabler/icons-react";
import type { QuestPointHistory } from "@/components/quest/types";
import {
	formatRelativeDate,
	getIpsDateFormats,
	readIpsDate,
} from "@/utils/date";
import { useQuestById } from "../context";
import styles from "./AwardsBalanceHistory.module.css";

interface AwardsBalanceHistoryProps {
	configurationId: string;
}

/**
 * AwardsBalanceHistory Component
 *
 * Displays the history of quest point awards for a specific quest.
 * Uses formatRelativeDate utility to show dates in a user-friendly format:
 * - Very recent: "Just now", "5 minutes ago", "2 hours ago"
 * - Today/Yesterday: "Today at 14:30", "Yesterday at 09:00"
 * - This week: "Monday at 10:15", "Thursday at 16:45"
 * - Older: "Aug 15", "Mar 20, 2024"
 *
 * Award types are displayed with appropriate icons:
 * - "Quest Points": Trophy icon (🏆)
 * - "Reset Quest Points": Refresh icon (🔄)
 * - Others: Coin icon (🪙)
 */
const AwardsBalanceHistory = ({
	configurationId,
}: AwardsBalanceHistoryProps) => {
	const currentQuest = useQuestById(configurationId);

	// Get questPointBalanceHistory from the current quest
	const questPointBalanceHistory: QuestPointHistory[] =
		currentQuest?.questPointBalanceHistory || [];

	const getIcon = (awardType: string) => {
		if (awardType === "Quest Points") {
			return <IconTrophy size={20} className={styles.iconTrophy} />;
		}
		if (awardType === "Reset Quest Points") {
			return <IconRefresh size={20} className={styles.iconRefresh} />;
		}
		return <IconCoin size={20} className={styles.iconCoin} />;
	};

	const getDescription = (entry: QuestPointHistory) => {
		if (entry.awardType === "Quest Points") {
			return `Level ${entry.level} Completion Reward`;
		}
		if (entry.awardType === "Reset Quest Points") {
			return `Quest Reset Bonus - Level ${entry.level}`;
		}
		return entry.awardType || "Quest Reward";
	};

	let currentDate = "";

	// Sort history by date (most recent first) if it exists
	const sortedHistory = [...questPointBalanceHistory].sort((a, b) => {
		const dateA =
			readIpsDate(a.redemptionDate || a.creationDate)?.getTime() ?? 0;
		const dateB =
			readIpsDate(b.redemptionDate || b.creationDate)?.getTime() ?? 0;
		return dateB - dateA;
	});

	return (
		<Stack gap="sm" className={styles.historyContainer}>
			{/* History Timeline */}
			<Stack gap="xs">
				{sortedHistory.length > 0 ? (
					sortedHistory.map((entry, index) => {
						const { date, time, showTime } = formatRelativeDate(
							entry.redemptionDate || entry.creationDate || "",
							getIpsDateFormats().dateTime,
						);

						// Only show date headers for non-relative dates (like "Today", "Yesterday", day names)
						const showDateHeader =
							date !== currentDate &&
							!date.includes("ago") &&
							!date.includes("Just now");
						currentDate = date;

						const amount = Number.parseFloat(entry.awardValue) || 0;

						return (
							// biome-ignore lint/suspicious/noArrayIndexKey: redemptions share dates and have no id
							<Stack key={`${entry.redemptionDate}-${index}`} gap={4}>
								{showDateHeader && index > 0 && (
									<Text
										size="xs"
										c="dimmed"
										fw={600}
										mt="md"
										mb="xs"
										className={styles.dateHeader}
									>
										{date}
									</Text>
								)}
								<Box className={styles.historyEntry}>
									<Group justify="space-between" align="center">
										<Group gap="md" align="center">
											{getIcon(entry.awardType)}
											<Stack gap={2}>
												<Text size="sm" fw={600} className={styles.entryTitle}>
													{getDescription(entry)}
												</Text>
												<Text size="xs" c="dimmed" className={styles.entryTime}>
													{!showDateHeader &&
													(date.includes("ago") || date === "Just now")
														? date
														: showTime && time
															? `${!showDateHeader ? `${date} at ` : ""}${time}`
															: date}
												</Text>
											</Stack>
										</Group>
										<Badge
											size="lg"
											radius="xl"
											variant="light"
											leftSection={<IconDiamond size={14} />}
											className={styles.amountBadge}
										>
											{amount.toLocaleString()}
										</Badge>
									</Group>
								</Box>
							</Stack>
						);
					})
				) : (
					<Box className={styles.emptyState}>
						<Box className={styles.emptyStateIcon}>
							<IconTrophy size={32} className={styles.emptyStateIconSvg} />
						</Box>
						<Text size="sm" fw={500} className={styles.emptyStateTitle}>
							No awards yet
						</Text>
						<Text size="xs" c="dimmed" className={styles.emptyStateDescription}>
							Complete quest levels to earn points!
						</Text>
					</Box>
				)}
			</Stack>
		</Stack>
	);
};

export default AwardsBalanceHistory;
