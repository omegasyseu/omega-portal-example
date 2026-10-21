import { Badge, Box, Group, Paper, Stack, Tabs, Title } from "@mantine/core";
import { IconTarget, IconTrophy, IconWorld } from "@tabler/icons-react";
import { useState } from "react";
import styles from "./LeaderboardPanel.module.css";
import CurrentLevelLeaderboard from "./leaderboard/CurrentLevelLeaderboard";
import OverallQuestLeaderboard from "./leaderboard/OverallQuestLeaderboard";

interface LeaderboardPanelProps {
	configurationId: string;
}

const LeaderboardPanel = ({ configurationId }: LeaderboardPanelProps) => {
	const [activeTab, setActiveTab] = useState<string | null>("overall");

	return (
		<Paper className={styles.container} shadow="lg">
			<Stack gap="md">
				{/* Header */}
				<Box className={styles.header}>
					<Group justify="space-between">
						<Title order={4} className={styles.title}>
							<IconTrophy size={20} />
							Leaderboard
						</Title>
						<Badge variant="filled" className={styles.badge}>
							Top 5
						</Badge>
					</Group>
				</Box>

				{/* Tabs */}
				<Tabs value={activeTab} onChange={setActiveTab} className={styles.tabs}>
					<Tabs.List className={styles.tabsList}>
						<Tabs.Tab
							value="overall"
							leftSection={<IconWorld size={14} />}
							className={styles.tab}
						>
							Overall Quest
						</Tabs.Tab>
						<Tabs.Tab
							value="level"
							leftSection={<IconTarget size={14} />}
							className={styles.tab}
						>
							Current Level
						</Tabs.Tab>
					</Tabs.List>

					{/* Overall Quest Leaderboard Panel */}
					<Tabs.Panel value="overall" pt="sm" className={styles.tabPanel}>
						<OverallQuestLeaderboard configurationId={configurationId} />
					</Tabs.Panel>

					{/* Current Level Leaderboard Panel */}
					<Tabs.Panel value="level" pt="sm" className={styles.tabPanel}>
						<CurrentLevelLeaderboard configurationId={configurationId} />
					</Tabs.Panel>
				</Tabs>
			</Stack>
		</Paper>
	);
};

export default LeaderboardPanel;
