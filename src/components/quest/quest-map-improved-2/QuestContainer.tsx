import {
	Box,
	Button,
	Collapse,
	Flex,
	Skeleton,
	Stack,
	Text,
} from "@mantine/core";
import { useMediaQuery, useReducedMotion } from "@mantine/hooks";
import React from "react";
import engage from "@/components/engage/engage.module.css";
import type { LevelUpDataType } from "@/schemas-types/levelup";
import BottomPanel from "./components/BottomPanel";
import LeaderboardPanel from "./components/LeaderboardPanel";
import ProgressHeader from "./components/ProgressHeader";
import QuestMapCanvas from "./components/QuestMapCanvas";
import { QuestInfoProvider, useQuestInfo } from "./context";

const QUEST_LOADING_HEIGHT = 480;

// The thin gold divider between the quest panels.
const GOLD_HAIRLINE =
	"1px solid color-mix(in srgb, var(--mantine-color-gold-filled) 20%, transparent)";

interface QuestCardProps {
	configurationId: string;
	isExpanded: boolean;
	onToggle: () => void;
}
const QuestCard = ({
	configurationId,
	isExpanded,
	onToggle,
}: QuestCardProps) => {
	const isLargeScreen = useMediaQuery("(min-width: 1400px)");
	const isMediumScreen = useMediaQuery("(min-width: 1200px)");
	const reduceMotion = useReducedMotion();

	return (
		<Box
			style={{
				background:
					"linear-gradient(to bottom right, var(--mantine-color-dark-9), var(--mantine-color-surface-filled), var(--mantine-color-dark-9))",
				borderRadius: "12px",
				border: "1px solid var(--mantine-color-gold-filled)",
				overflow: "hidden",
				boxShadow:
					"0 0 30px color-mix(in srgb, var(--mantine-color-gold-filled) 15%, transparent), inset 0 0 20px color-mix(in srgb, var(--mantine-color-gold-filled) 5%, transparent)",
				width: "100%",
			}}
		>
			<ProgressHeader
				configurationId={configurationId}
				controlsOpened={isExpanded}
				onToggleControls={onToggle}
			/>

			<Collapse
				expanded={isExpanded}
				transitionDuration={reduceMotion ? 0 : undefined}
			>
				<Box
					style={{
						display: "flex",
						flexDirection: "column",
						borderTop: GOLD_HAIRLINE,
						width: "100%",
						overflow: "hidden",
					}}
				>
					{/* Main Content Area */}
					<Flex style={{ flex: 1, overflow: "hidden", minHeight: 0, gap: 0 }}>
						{/* Left: Quest Map */}
						<Box
							style={{
								flex: "1 1 auto",
								minWidth: 0,
								display: "flex",
								flexDirection: "column",
							}}
						>
							{/* Quest Map - Top */}
							<Box
								style={{
									flex: "1 1 70%",
									display: "flex",
									borderRight: isMediumScreen ? GOLD_HAIRLINE : "none",
								}}
							>
								<QuestMapCanvas configurationId={configurationId} />
							</Box>

							{/* Bottom Panel */}
							<Box
								style={{
									flex: "0 1 30%",
									minHeight: "180px",
									maxHeight: "280px",
									borderTop: GOLD_HAIRLINE,
									borderRight: isMediumScreen ? GOLD_HAIRLINE : "none",
									overflow: "hidden",
								}}
							>
								<BottomPanel configurationId={configurationId} />
							</Box>
						</Box>

						{/* Right: Leaderboard - Responsive width based on screen size */}
						{isMediumScreen && (
							<Box
								style={{
									flex: "0 0 auto",
									width: isLargeScreen ? "320px" : "260px",
									overflow: "hidden",
								}}
							>
								<LeaderboardPanel configurationId={configurationId} />
							</Box>
						)}
					</Flex>
				</Box>
			</Collapse>
		</Box>
	);
};

const QuestContainerInner = () => {
	const { questInfo } = useQuestInfo();

	// Initialize with first quest expanded if available
	const [expandedCardId, setExpandedCardId] = React.useState<string | null>(
		null,
	);

	// Set first quest as expanded when data loads
	React.useEffect(() => {
		if (questInfo.data?.data?.[0]?.configurationId && expandedCardId === null) {
			setExpandedCardId(questInfo.data.data[0].configurationId);
		}
	}, [questInfo.data?.data, expandedCardId]);

	console.log(questInfo.data?.data);

	const handleToggleCard = (configurationId: string) => {
		setExpandedCardId((current) =>
			current === configurationId ? null : configurationId,
		);
	};

	if (questInfo.isLoading) {
		return <Skeleton height={QUEST_LOADING_HEIGHT} radius="lg" />;
	}
	if (questInfo.isError) {
		return (
			<Stack gap="sm" align="center" className={engage.empty} w="100%">
				<Text>Your quest couldn&#39;t be loaded.</Text>
				<Button variant="default" onClick={() => questInfo.refetch()}>
					Try again
				</Button>
			</Stack>
		);
	}
	if (!questInfo.data?.data?.length) {
		return (
			<Text className={engage.empty} w="100%">
				There&#39;s no quest running right now. Check back soon.
			</Text>
		);
	}

	return (
		<Stack style={{ width: "100%", overflow: "hidden" }}>
			{questInfo.data?.data?.map((quest: LevelUpDataType) => (
				<QuestCard
					key={quest.configurationId}
					configurationId={quest.configurationId}
					isExpanded={expandedCardId === quest.configurationId}
					onToggle={() => handleToggleCard(quest.configurationId)}
				/>
			))}
		</Stack>
	);
};

const QuestContainer = () => {
	return (
		<QuestInfoProvider>
			<QuestContainerInner />
		</QuestInfoProvider>
	);
};

export default QuestContainer;
