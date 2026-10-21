import {
	Badge,
	Box,
	Button,
	Card,
	Center,
	Group,
	Loader,
	Modal,
	SimpleGrid,
	Stack,
	Text,
	Title,
	Tooltip,
} from "@mantine/core";
import {
	IconCoins,
	IconDiamond,
	IconDice,
	IconPackage,
	IconShoppingCart,
	IconUser,
	IconUsers,
} from "@tabler/icons-react";
import { useGetAvailablePurchaseItems } from "@/components/quest/queries/useGetAvailablePurchaseItems";
import { usePurchaseQuestItem } from "@/components/quest/queries/usePurchaseQuestItem";
import type { AvailablePurchaseItem } from "@/components/quest/types";
import { useSession } from "@/providers/authentication/authentication";
import styles from "./QuestPurchaseModal.module.css";

interface QuestPurchaseModalProps {
	opened: boolean;
	onClose: () => void;
	questId?: string;
	level?: number;
}

export const QuestPurchaseModal = ({
	opened,
	onClose,
	questId,
	level,
}: QuestPurchaseModalProps) => {
	const { session } = useSession();
	const sessionKey = session?.user?.sessionKey;

	const {
		data: purchaseData,
		isLoading,
		error,
	} = useGetAvailablePurchaseItems({
		sessionKey,
		configurationId: questId,
		level,
		enabled: opened && !!questId && level !== undefined,
	});

	const availableItems = purchaseData?.items;
	const questShopName = purchaseData?.configurationName || "Quest Shop";
	const questPointBalance = purchaseData?.questPointBalance || 0;

	const { purchaseLoading, purchaseItem } = usePurchaseQuestItem(sessionKey);

	const renderItemCard = (item: AvailablePurchaseItem) => {
		// Get appropriate icon based on item type
		const getAmountIcon = () => {
			const upperType = item.type?.toUpperCase();
			switch (upperType) {
				case "FREE_SPIN":
				case "FREE_SPINS":
					return <IconDice size={16} className={styles.goldIcon} />;
				case "BONUS":
					return <IconCoins size={16} className={styles.goldIcon} />;
				default:
					return <IconPackage size={16} className={styles.goldIcon} />;
			}
		};

		// Format display values
		const formattedPrice = item.price ? item.price.toLocaleString() : "FREE";
		const formattedAmount = item.amount ? item.amount.toLocaleString() : "";

		// Stock info text
		const stockInfo = item.availability
			? `${item.availability.remainingGlobal}/${item.availability.totalQuantity}`
			: null;

		// Purchase limit info
		const purchaseInfo = item.availability
			? `${item.availability.playerCanPurchase}/${item.availability.playerMaxAllowed}`
			: null;

		const canPurchase =
			(item.availability?.playerCanPurchase ?? 0) > 0 &&
			!item.availability?.soldOut;

		return (
			<Card
				key={item.id}
				shadow="md"
				padding={0}
				radius="md"
				withBorder
				className={styles.card}
			>
				{/* Header Section - Purple */}
				<div className={styles.headerSection}>
					<Group
						className={styles.topRow}
						wrap="nowrap"
						justify="space-between"
					>
						<Badge size="sm" variant="light" className={styles.typeBadge}>
							{item.type || "REWARD"}
						</Badge>

						{item.amount ? (
							<Tooltip
								label={`You'll receive ${formattedAmount} ${item.type || "rewards"}`}
								position="top"
							>
								<Group className={styles.amountGroup} wrap="nowrap" gap={4}>
									{getAmountIcon()}
									<Text size="sm" fw={600} className={styles.amountText}>
										{formattedAmount}
									</Text>
								</Group>
							</Tooltip>
						) : null}
					</Group>
				</div>

				{/* Bottom Section - Black */}
				<div className={styles.bottomSection}>
					{/* Description */}
					<Text
						size="xs"
						fw={600}
						lineClamp={1}
						className={styles.descriptionText}
					>
						{item.description || item.type || "Quest Reward"}
					</Text>

					{/* Bottom Row - Availability and Price */}
					<Group
						className={styles.bottomRow}
						wrap="nowrap"
						gap={4}
						justify="space-between"
					>
						{/* Stock & Limits - Now on the left */}
						{item.availability && (
							<Group className={styles.stockGroup} wrap="nowrap" gap={8}>
								{/* Global Stock */}
								{stockInfo && (
									<Tooltip label="Remaining/Total Available" position="top">
										<Group
											className={styles.iconTextGroup}
											wrap="nowrap"
											gap={2}
										>
											<IconUsers size={14} className={styles.goldIcon} />
											<Text size="xs" c="dimmed">
												{stockInfo}
											</Text>
										</Group>
									</Tooltip>
								)}

								{/* Purchase Limit */}
								{purchaseInfo && (
									<Tooltip label="Remaining/Player Available" position="top">
										<Group
											className={styles.iconTextGroup}
											wrap="nowrap"
											gap={2}
										>
											<IconUser size={14} className={styles.goldIcon} />
											<Text size="xs" c="dimmed">
												{purchaseInfo}
											</Text>
										</Group>
									</Tooltip>
								)}
							</Group>
						)}

						{/* Purchase Button - Now on the right */}
						<Tooltip
							label={
								!canPurchase
									? item.availability?.soldOut
										? "This item is sold out"
										: `You've reached the purchase limit (${item.availability?.playerMaxAllowed || 0})`
									: `Purchase for ${formattedPrice} points`
							}
							position="top"
							disabled={false}
						>
							<div style={{ display: "inline-block" }}>
								<Button
									size="xs"
									variant="subtle"
									className={styles.purchaseButton}
									onClick={() => {
										if (!item.id || item.level === undefined) return;
										purchaseItem({ id: item.id, level: item.level });
									}}
									disabled={purchaseLoading === item.id || !canPurchase}
									leftSection={
										purchaseLoading === item.id ? (
											<Loader size={12} color="gold" />
										) : (
											<IconShoppingCart size={14} />
										)
									}
								>
									{purchaseLoading === item.id ? "" : formattedPrice}
								</Button>
							</div>
						</Tooltip>
					</Group>
				</div>
			</Card>
		);
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			trapFocus={false}
			title={
				<Box style={{ width: "100%", paddingRight: "120px" }}>
					<Group justify="space-between" wrap="nowrap">
						<Title order={3} c="dark.0">
							<Group gap="xs" wrap="nowrap">
								<IconShoppingCart size={24} />
								<span>{questShopName}</span>
								{level !== undefined && (
									<Badge
										size="lg"
										styles={{
											root: {
												backgroundColor: "var(--mantine-color-dark-6)",
												color: "var(--mantine-color-gold-filled)",
												border: "1px solid var(--mantine-color-gold-filled)",
											},
										}}
									>
										Level {level}
									</Badge>
								)}
							</Group>
						</Title>
						<Badge
							size="lg"
							styles={{
								root: {
									border: "1px solid var(--mantine-color-gold-filled)",
									color: "var(--mantine-color-gold-filled)",
									backgroundColor: "transparent",
									fontWeight: 600,
									fontSize: "14px",
									position: "absolute",
									right: "40px",
									top: "50%",
									transform: "translateY(-50%)",
								},
							}}
							leftSection={
								<IconDiamond
									size={18}
									style={{ color: "var(--mantine-color-gold-filled)" }}
								/>
							}
						>
							{questPointBalance?.toLocaleString() || 0}
						</Badge>
					</Group>
				</Box>
			}
			size="lg"
			centered
			closeOnEscape={true}
			closeOnClickOutside={false}
			overlayProps={{
				backgroundOpacity: 0.55,
				blur: 3,
			}}
			styles={{
				content: {
					backgroundColor: "var(--mantine-color-surface-filled)",
					border: "1px solid var(--mantine-color-dark-4)",
				},
				header: {
					backgroundColor: "var(--mantine-color-surface-filled)",
					borderBottom: "1px solid var(--mantine-color-dark-4)",
					position: "relative",
				},
				body: {
					padding: "var(--mantine-spacing-xs)",
				},
				title: {
					color: "var(--mantine-color-dark-0)",
					width: "100%",
				},
				close: {
					backgroundColor: "transparent",
					color: "var(--mantine-color-dark-1)",
					"&:focus": {
						outline: "none",
						boxShadow: "none",
					},
					"&:focus-visible": {
						outline: "2px solid var(--mantine-color-gold-filled)",
						outlineOffset: 2,
					},
				},
			}}
		>
			{isLoading ? (
				<Center h={200}>
					<Loader size="lg" color="gold" />
				</Center>
			) : error ? (
				<Center h={200}>
					<Stack align="center" gap="md">
						<Text c="danger" fw={500}>
							Failed to load available items
						</Text>
						<Text size="sm" c="dark.2">
							Please try again later
						</Text>
					</Stack>
				</Center>
			) : availableItems && availableItems.length > 0 ? (
				<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
					{availableItems.map(renderItemCard)}
				</SimpleGrid>
			) : (
				<Center h={200}>
					<Stack align="center" gap="md">
						<Box c="dark.2">
							<IconPackage size={48} stroke={1.5} />
						</Box>
						<Text fw={500} c="dark.0">
							No items available
						</Text>
						<Text size="sm" c="dark.2">
							Check back later for new rewards!
						</Text>
					</Stack>
				</Center>
			)}
		</Modal>
	);
};
