import {
	Badge,
	Button,
	Card,
	Group,
	Loader,
	Text,
	Tooltip,
} from "@mantine/core";
import {
	IconCoins,
	IconDice,
	IconLock,
	IconPackage,
	IconShoppingCart,
	IconUser,
	IconUsers,
} from "@tabler/icons-react";
import type React from "react";
import { useMemo } from "react";
import { usePurchaseQuestItem } from "@/components/quest/queries/usePurchaseQuestItem";
import { useSession } from "@/providers/authentication/authentication";
import type { QuestItemType } from "@/schemas-types/levelup";
import styles from "./QuestRewardCard.module.css";

interface QuestRewardCardProps {
	x: number;
	y: number;
	item: QuestItemType;
	isAccessible: boolean;
	opacity?: number;
}

export const QuestRewardCard: React.FC<QuestRewardCardProps> = ({
	x,
	y,
	item,
	isAccessible,
	opacity = 1,
}) => {
	const { session } = useSession();
	const { purchaseLoading, purchaseItem } = usePurchaseQuestItem(
		session?.user?.sessionKey,
	);

	// Get appropriate icon based on item type
	const getAmountIcon = useMemo(() => {
		const upperType = item.type?.toUpperCase();
		switch (upperType) {
			case "FREE_SPIN":
				return <IconDice size={16} className={styles.goldIcon} />;
			case "BONUS":
				return <IconCoins size={16} className={styles.goldIcon} />;
			default:
				return <IconPackage size={16} className={styles.goldIcon} />;
		}
	}, [item.type]);

	// Format display values
	const formattedPrice = useMemo(() => {
		if (!item.price) return "FREE";
		return item.price.toLocaleString();
	}, [item.price]);

	const formattedAmount = useMemo(() => {
		if (!item.amount) return "";
		return item.amount.toLocaleString();
	}, [item.amount]);

	// Stock info text
	const stockInfo = useMemo(() => {
		if (!item.availability) return null;
		return `${item.availability.remainingGlobal}/${item.availability.totalQuantity}`;
	}, [item.availability]);

	// Purchase limit info
	const purchaseInfo = useMemo(() => {
		if (!item.availability) return null;
		const playerRemaining =
			item.availability.playerMaxAllowed - item.availability.playerPurchased;
		return `${playerRemaining}/${item.availability.playerMaxAllowed}`;
	}, [item.availability]);

	// Card dimensions - wide enough for stock counters (e.g. 1000/1000) plus the purchase button
	const cardWidth = 230;
	const cardHeight = 100;

	return (
		<foreignObject
			x={x - cardWidth / 2}
			y={y - cardHeight / 2}
			width={cardWidth}
			height={cardHeight}
			style={{ opacity }}
		>
			<Card
				shadow="md"
				padding={0}
				radius="md"
				withBorder
				className={`${styles.card} ${isAccessible ? styles.cardAccessible : styles.cardLocked}`}
				style={{
					width: cardWidth,
					height: cardHeight,
					overflow: "hidden",
				}}
			>
				{/* Header Section - brand blue */}
				<div className={styles.headerSection}>
					<Group className={styles.topRow} wrap="nowrap">
						<Badge size="sm" variant="light" className={styles.typeBadge}>
							{item.type || "REWARD"}
						</Badge>

						{item.amount ? (
							<Tooltip
								label={`You'll receive ${formattedAmount} ${item.type || "rewards"}`}
								position="top"
							>
								<Group className={styles.amountGroup} wrap="nowrap">
									{getAmountIcon}
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
						{item.description || "Reward"}
					</Text>

					{/* Bottom Row - Availability and Price */}
					<Group className={styles.bottomRow} wrap="nowrap" gap={4}>
						{/* Stock & Limits - Now on the left */}
						{item.availability && (
							<Group className={styles.stockGroup} wrap="nowrap">
								{/* Global Stock */}
								{stockInfo && (
									<Tooltip label="Remaining/Total Available" position="top">
										<Group className={styles.iconTextGroup} wrap="nowrap">
											<IconUsers size={14} className={styles.goldIcon} />
											<Text size="xs" c="dimmed" truncate>
												{stockInfo}
											</Text>
										</Group>
									</Tooltip>
								)}

								{/* Purchase Limit */}
								{purchaseInfo && (
									<Tooltip label="Remaining/Player Available" position="top">
										<Group className={styles.iconTextGroup} wrap="nowrap">
											<IconUser size={14} className={styles.goldIcon} />
											<Text size="xs" c="dimmed" truncate>
												{purchaseInfo}
											</Text>
										</Group>
									</Tooltip>
								)}
							</Group>
						)}

						{/* Purchase Button - Now on the right */}
						{item.price !== undefined && isAccessible && (
							<Tooltip
								label={
									!item.availability?.playerCanPurchase
										? item.availability?.soldOut
											? "This item is sold out"
											: `You've reached the purchase limit (${item.availability?.playerMaxAllowed || 0})`
										: `Purchase for ${formattedPrice} points`
								}
								position="top"
								disabled={false}
							>
								<div style={{ display: "inline-block", flexShrink: 0 }}>
									<Button
										size="xs"
										variant="subtle"
										className={styles.purchaseButton}
										onClick={() =>
											purchaseItem({
												id: item.id,
												level: item.level,
											})
										}
										disabled={
											purchaseLoading === item.id ||
											!item.availability?.playerCanPurchase
										}
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
						)}
						{item.price !== undefined && !isAccessible && (
							<Group className={styles.priceGroup} wrap="nowrap">
								<IconShoppingCart size={14} className={styles.goldIcon} />
								<Text size="xs" c="dimmed">
									{formattedPrice}
								</Text>
							</Group>
						)}
					</Group>

					{/* Bottom Status Row - Locked only */}
					{!isAccessible && (
						<Badge
							size="xs"
							variant="filled"
							color="dark"
							leftSection={<IconLock size={10} />}
							style={{ alignSelf: "center" }}
						>
							Lvl {item.level}
						</Badge>
					)}
				</div>
			</Card>
		</foreignObject>
	);
};

export default QuestRewardCard;
