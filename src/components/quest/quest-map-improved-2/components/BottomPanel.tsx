import { Box, Divider, Group, Paper, Title } from "@mantine/core";
import { IconHistory, IconShoppingCart } from "@tabler/icons-react";
import AwardsBalanceHistory from "./AwardsBalanceHistory";
import styles from "./BottomPanel.module.css";
import PurchasedItems from "./PurchasedItems";

interface BottomPanelProps {
	configurationId: string;
}

const BottomPanel = ({ configurationId }: BottomPanelProps) => {
	return (
		<Paper className={styles.container} shadow="lg">
			<Box className={styles.contentWrapper}>
				{/* Awards History Section */}
				<Box className={styles.section}>
					<Box className={styles.sectionHeader}>
						<Group gap="xs">
							<IconHistory size={20} className={styles.headerIcon} />
							<Title order={4} className={styles.sectionTitle}>
								Quest Points Award History
							</Title>
						</Group>
					</Box>
					<Box className={styles.sectionContent}>
						<AwardsBalanceHistory configurationId={configurationId} />
					</Box>
				</Box>

				{/* Vertical Divider */}
				<Divider orientation="vertical" className={styles.divider} />

				{/* Purchased Items Section */}
				<Box className={styles.section}>
					<Box className={styles.sectionHeader}>
						<Group gap="xs">
							<IconShoppingCart size={20} className={styles.headerIcon} />
							<Title order={4} className={styles.sectionTitle}>
								Purchased Items
							</Title>
						</Group>
					</Box>
					<Box className={styles.sectionContent}>
						<PurchasedItems configurationId={configurationId} />
					</Box>
				</Box>
			</Box>
		</Paper>
	);
};

export default BottomPanel;
