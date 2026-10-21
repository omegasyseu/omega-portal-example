import {
	ActionIcon,
	Badge,
	Box,
	Group,
	Paper,
	Progress,
	Text,
	Title,
} from "@mantine/core";
import {
	IconChevronDown,
	IconChevronUp,
	IconDiamond,
} from "@tabler/icons-react";
import { calculateTimeRemaining } from "@/utils/date";
import { useQuestById } from "../context";
import styles from "./ProgressHeader.module.css";

interface ProgressHeaderProps {
	configurationId: string;
	controlsOpened: boolean;
	onToggleControls: () => void;
}

const ProgressHeader = ({
	configurationId,
	controlsOpened,
	onToggleControls,
}: ProgressHeaderProps) => {
	const quest = useQuestById(configurationId);

	if (!quest) {
		return null;
	}

	const {
		title,
		endDate,
		questPointBalance,
		percentage,
		currentLevel,
		maxLevel,
		progress,
		target,
	} = quest;

	// Calculate time remaining if endDate is available
	const timeRemaining = endDate ? calculateTimeRemaining(endDate) : null;

	// Build progress text based on the level the player is working towards
	let progressText = "";

	if (currentLevel === maxLevel) {
		progressText = `Level ${maxLevel} of ${maxLevel} - You've reached the end!`;
	} else {
		const nextLevel = currentLevel + 1;
		progressText = `Level ${nextLevel} of ${maxLevel}`;

		if (progress !== undefined && target !== undefined && Number(target) > 0) {
			const percentToNext = Math.round((progress / Number(target)) * 100);
			progressText += ` - ${percentToNext}% complete`;
		}
	}

	// Calculate actual progress percentage if not provided
	const progressPercentage =
		percentage ||
		(progress !== undefined && target !== undefined && Number(target) > 0
			? Math.round((progress / Number(target)) * 100)
			: 0);

	return (
		<Paper shadow="lg" radius="md" className={styles.container}>
			{/* Header Section */}
			<Box
				className={styles.header}
				onClick={onToggleControls}
				style={{ cursor: "pointer" }}
			>
				<Group justify="space-between" align="center">
					<Title order={3} className={styles.title}>
						{title}
					</Title>
					<Group gap="md">
						{timeRemaining && (
							<Badge size="xl" variant="filled" className={styles.badge}>
								{timeRemaining.formattedString}
							</Badge>
						)}
						<Badge
							size="xl"
							variant="filled"
							leftSection={
								<IconDiamond size={18} className={styles.coinIcon} />
							}
							className={styles.badge}
						>
							{questPointBalance?.toLocaleString() || 0}
						</Badge>
						<ActionIcon
							onClick={(e) => {
								e.stopPropagation();
								onToggleControls();
							}}
							variant="subtle"
							size="xl"
							className={styles.actionButton}
						>
							{controlsOpened ? (
								<IconChevronUp size={24} />
							) : (
								<IconChevronDown size={24} />
							)}
						</ActionIcon>
					</Group>
				</Group>
			</Box>

			{/* Content Area */}
			<Box className={styles.contentArea}>
				<Box className={styles.progressContainer}>
					<Progress.Root size="xl" radius="xl" className={styles.progressRoot}>
						<Progress.Section
							value={progressPercentage}
							className={styles.progressSection}
						/>
					</Progress.Root>
					<Box className={styles.progressOverlay}>
						<Text
							size="sm"
							fw={500}
							className={`${styles.progressText} ${
								progressPercentage > 50
									? styles.progressTextDark
									: styles.progressTextLight
							}`}
						>
							{`${progress || 0} / ${target || 0}`}
						</Text>
					</Box>
				</Box>

				<Text size="sm" className={styles.levelText}>
					{progressText}
				</Text>
			</Box>
		</Paper>
	);
};

export default ProgressHeader;
