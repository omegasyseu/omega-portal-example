import { Badge, Box, Group, Stack, Text } from "@mantine/core";
import {
	IconCoin,
	IconCoins,
	IconDice,
	IconPackage,
} from "@tabler/icons-react";
import {
	formatRelativeDate,
	getIpsDateFormats,
	readIpsDate,
} from "@/utils/date";
import { useQuestById } from "../context/QuestInfoProvider";
import styles from "./PurchasedItems.module.css";

interface PurchasedItemsProps {
	configurationId: string;
}

interface PurchasedItem {
	id: string;
	type: string;
	level?: number;
	price: number;
	amount: number;
	configurationId: string;
	configurationTypeId: string;
	creationDate: string;
}

const PurchasedItems = ({ configurationId }: PurchasedItemsProps) => {
	const currentQuest = useQuestById(configurationId);

	// Get purchased items from currentQuest
	// @ts-expect-error - purchasedItems may not be in the schema yet but exists at runtime
	const purchasedItems: PurchasedItem[] = currentQuest?.purchasedItems || [];

	const getItemIcon = (type: string) => {
		const upperType = type?.toUpperCase();
		switch (upperType) {
			case "FREE_SPIN":
				return <IconDice size={20} className={styles.iconFreeSpins} />;
			case "BONUS":
				return <IconCoins size={20} className={styles.iconBonus} />;
			default:
				return <IconPackage size={20} className={styles.iconDefault} />;
		}
	};

	const getTypeLabel = (type: string) => {
		const upperType = type?.toUpperCase();
		switch (upperType) {
			case "FREE_SPIN":
				return "Free Spins";
			case "BONUS":
				return "Bonus";
			default:
				return "Package";
		}
	};

	// Sort all items by date (most recent first)
	const sortedItems = [...purchasedItems].sort((a, b) => {
		const dateA = readIpsDate(a.creationDate)?.getTime() ?? 0;
		const dateB = readIpsDate(b.creationDate)?.getTime() ?? 0;
		return dateB - dateA;
	});

	return (
		<Stack gap="sm">
			{sortedItems.length > 0 ? (
				<Stack gap="xs">
					{sortedItems.map((item) => {
						const { date, time, showTime } = formatRelativeDate(
							item.creationDate,
							getIpsDateFormats().dateTime,
						);
						const formattedDate =
							date.includes("ago") || date === "Just now"
								? date
								: showTime && time
									? `${date} at ${time}`
									: date;

						return (
							<Box key={item.id} className={styles.itemEntry}>
								<Group justify="space-between" align="center">
									<Group gap="md" align="center">
										{getItemIcon(item.type)}
										<Stack gap={2}>
											<Text size="sm" fw={600} className={styles.itemTitle}>
												{getTypeLabel(item.type)}
											</Text>
											<Text
												size="xs"
												c="dimmed"
												className={styles.itemDescription}
											>
												{formattedDate}
											</Text>
										</Stack>
									</Group>
									<Badge
										size="lg"
										radius="xl"
										variant="light"
										leftSection={<IconCoin size={14} />}
										className={styles.priceBadge}
									>
										{item.price.toLocaleString()}
									</Badge>
								</Group>
							</Box>
						);
					})}
				</Stack>
			) : (
				<Box className={styles.emptyState}>
					<Box className={styles.emptyStateIcon}>
						<IconPackage size={32} className={styles.emptyStateIconSvg} />
					</Box>
					<Text size="sm" fw={500} className={styles.emptyStateTitle}>
						No purchases yet
					</Text>
					<Text size="xs" c="dimmed" className={styles.emptyStateDescription}>
						Use your quest points to purchase rewards!
					</Text>
				</Box>
			)}
		</Stack>
	);
};

export default PurchasedItems;
