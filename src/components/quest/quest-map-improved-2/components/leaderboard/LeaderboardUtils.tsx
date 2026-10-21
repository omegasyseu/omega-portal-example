import { Text } from "@mantine/core";
import { IconAward, IconCrown, IconMedal } from "@tabler/icons-react";

export interface OverallLeaderboardEntry {
	rank: number;
	player: string;
	level: number;
	totalPoints: number;
}

export interface CurrentLevelLeaderboardEntry {
	rank: number;
	player: string;
	progress: number;
	itemsPurchased: number;
}

export const getRankIcon = (rank: number, styles: Record<string, string>) => {
	switch (rank) {
		case 1:
			return <IconCrown size={20} className={styles.goldIcon} />;
		case 2:
			return <IconMedal size={20} className={styles.silverIcon} />;
		case 3:
			return <IconAward size={20} className={styles.bronzeIcon} />;
		default:
			return (
				<Text size="sm" fw={600} c="dark.0">
					{rank}
				</Text>
			);
	}
};
