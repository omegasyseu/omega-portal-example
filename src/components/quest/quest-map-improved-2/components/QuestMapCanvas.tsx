import { ActionIcon, Box, Group, Paper, Text } from "@mantine/core";
import {
	IconFlag,
	IconFocus2,
	IconLock,
	IconMinus,
	IconPlus,
	IconSparkles,
	IconTrophy,
} from "@tabler/icons-react";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import questBackground from "@/assets/quest_background.svg?url";
import questBackgroundTitle from "@/assets/quest_background_title.svg?url";
import type { QuestLevelType } from "@/schemas-types/levelup";
import { useQuestById } from "../context";
import styles from "./QuestMapCanvas.module.css";
import { QuestRewardCard } from "./QuestRewardCard";

interface MapPosition {
	x: number;
	y: number;
}

interface DragState {
	x: number;
	y: number;
}

interface QuestNode {
	id: number;
	x: number;
	y: number;
	label: string;
	level: number;
	isAccessible: boolean;
	isCurrent: boolean;
	isCompleted: boolean;
	itemCount: number;
	purchasedCount: number;
	connections: number[];
	progressPercentage?: number; // Add progress percentage for current level
}

interface QuestMapCanvasProps {
	configurationId: string;
}

interface RewardCardsRendererProps {
	node: QuestNode;
	nodeIndex: number;
	questLevels: QuestLevelType[];
	hoveredNode: number | null;
	selectedNode: number | null;
}

// Configuration constants
const QUEST_MAP_CONFIG = {
	DEFAULT_SCALE: 1, // Reduced default scale to fit wider layout
	MIN_SCALE: 0.4,
	MAX_SCALE: 2.5,
	ZOOM_IN_FACTOR: 1.1,
	ZOOM_OUT_FACTOR: 0.9,
	NODE_SPACING: 200, // Increased spacing between nodes to prevent overlap
	START_POSITION: { x: 100, y: 350 }, // Moved up from 500 to be more centered
	END_POSITION: { x: 1100, y: 200 }, // Adjusted to match new start position
	SVG_DIMENSIONS: { width: 1200, height: 700 }, // Reduced height to fit better
	NODE_SIZES: {
		default: 24,
		current: 32,
		completed: 20,
	},
	ANIMATION_DURATION: "2s",
	CARD_VERTICAL_SPACING: 110, // Space between stacked reward cards
	CARD_VERTICAL_OFFSET: 100, // Distance of cards above node
} as const;

const QuestMapCanvas = ({ configurationId }: QuestMapCanvasProps) => {
	const canvasRef = useRef<HTMLDivElement>(null);

	// Pan and zoom state
	const [scale, setScale] = useState<number>(QUEST_MAP_CONFIG.DEFAULT_SCALE);
	const [position, setPosition] = useState<MapPosition>({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState<DragState>({ x: 0, y: 0 });
	const [hoveredNode, setHoveredNode] = useState<number | null>(null);
	const [selectedNode, setSelectedNode] = useState<number | null>(null);

	const quest = useQuestById(configurationId);

	// Generate quest nodes from quest levels data
	const generateQuestNodes = useCallback(
		(
			levels: QuestLevelType[],
			currentLevel: number,
			percentage?: number,
		): QuestNode[] => {
			if (!levels || levels.length === 0) return [];

			const nodes: QuestNode[] = [];
			const totalNodes = levels.length + 1; // Always include start node

			// Always add start node
			nodes.push({
				id: 0,
				x: QUEST_MAP_CONFIG.START_POSITION.x + 50, // Move start node more to the right to avoid cutoff
				y: QUEST_MAP_CONFIG.START_POSITION.y,
				label: "Start",
				level: 0,
				isAccessible: currentLevel === 0,
				isCurrent: currentLevel === 0,
				isCompleted: currentLevel > 0, // Start node is completed if we've moved past level 0
				itemCount: 0,
				purchasedCount: 0,
				connections: levels.length > 0 ? [1] : [],
				progressPercentage: currentLevel === 0 ? percentage : undefined,
			});

			levels.forEach((level, index) => {
				// Calculate position with consistent spacing between nodes
				const nodeIndex = index + 1; // Always account for start node

				// Use consistent spacing between nodes instead of interpolation
				const x =
					QUEST_MAP_CONFIG.START_POSITION.x +
					nodeIndex * QUEST_MAP_CONFIG.NODE_SPACING;

				// Create a gentle wave pattern for visual interest
				const waveProgress = nodeIndex / Math.max(totalNodes - 1, 1);
				const y =
					QUEST_MAP_CONFIG.START_POSITION.y +
					(QUEST_MAP_CONFIG.END_POSITION.y -
						QUEST_MAP_CONFIG.START_POSITION.y) *
						waveProgress +
					Math.sin(waveProgress * Math.PI) * 60; // Gentle curve for visual variety

				const isCurrent = level.level === currentLevel;
				const isCompleted = level.level < currentLevel;

				nodes.push({
					id: level.level,
					x,
					y,
					label: `Level ${level.level}`,
					level: level.level,
					isAccessible: level.accessible,
					isCurrent,
					isCompleted,
					itemCount: level.itemCount,
					purchasedCount: level.purchasedCount,
					connections: nodeIndex < totalNodes - 1 ? [level.level + 1] : [],
					progressPercentage: isCurrent ? percentage : undefined,
				});
			});

			return nodes;
		},
		[],
	);

	const nodes = quest
		? generateQuestNodes(quest.levels, quest.currentLevel, quest.percentage)
		: [];

	// Calculate dynamic canvas dimensions based on nodes and reward cards
	const calculateCanvasDimensions = () => {
		if (nodes.length === 0)
			return { ...QUEST_MAP_CONFIG.SVG_DIMENSIONS, minX: 0, minY: 0 };

		let minY = Number.POSITIVE_INFINITY;
		let maxY = Number.NEGATIVE_INFINITY;
		let minX = Number.POSITIVE_INFINITY;
		let maxX = Number.NEGATIVE_INFINITY;

		// Calculate actual bounds including nodes and their reward cards
		for (const node of nodes) {
			// Account for node position
			minX = Math.min(minX, node.x - 100);
			maxX = Math.max(maxX, node.x + 100);
			minY = Math.min(minY, node.y - 50);
			maxY = Math.max(maxY, node.y + 50);

			// Account for reward cards above nodes (if they have items)
			if (node.level > 0 && quest?.levels) {
				const questLevel = quest.levels.find(
					(level) => level.level === node.level,
				);
				if (questLevel?.items && questLevel.items.length > 0) {
					// Cards are positioned using the configured spacing
					// The topmost card would be at:
					const topCardY =
						node.y -
						QUEST_MAP_CONFIG.CARD_VERTICAL_OFFSET -
						(questLevel.items.length - 1) *
							QUEST_MAP_CONFIG.CARD_VERTICAL_SPACING -
						60;
					minY = Math.min(minY, topCardY);
					// Account for card width
					minX = Math.min(minX, node.x - 120);
					maxX = Math.max(maxX, node.x + 120);
				}
			}
		}

		// Add padding
		const padding = 150;

		// Calculate total dimensions including negative space
		const width = maxX - minX + padding * 2;
		const height = maxY - minY + padding * 2;

		return {
			width,
			height,
			minX: minX - padding,
			minY: minY - padding,
		};
	};

	const canvasDimensions = calculateCanvasDimensions();

	// Mouse event handlers for pan functionality
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			const target = e.target as HTMLElement;
			if (e.target === canvasRef.current || target.tagName === "svg") {
				setIsDragging(true);
				setDragStart({
					x: e.clientX - position.x,
					y: e.clientY - position.y,
				});
			}
		},
		[position],
	);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (isDragging) {
				setPosition({
					x: e.clientX - dragStart.x,
					y: e.clientY - dragStart.y,
				});
			}
		},
		[isDragging, dragStart],
	);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
	}, []);

	// Control button handlers
	const handleZoomIn = useCallback(() => {
		setScale((prevScale) =>
			Math.min(
				prevScale * QUEST_MAP_CONFIG.ZOOM_IN_FACTOR,
				QUEST_MAP_CONFIG.MAX_SCALE,
			),
		);
	}, []);

	const handleZoomOut = useCallback(() => {
		setScale((prevScale) =>
			Math.max(
				prevScale * QUEST_MAP_CONFIG.ZOOM_OUT_FACTOR,
				QUEST_MAP_CONFIG.MIN_SCALE,
			),
		);
	}, []);

	const handleCenterToCurrentNode = useCallback(() => {
		const currentNode = nodes.find((node) => node.isCurrent);
		if (currentNode && canvasRef.current) {
			const canvasRect = canvasRef.current.getBoundingClientRect();
			const canvasWidth = canvasRect.width;
			const canvasHeight = canvasRect.height;

			// Reset zoom to default
			setScale(QUEST_MAP_CONFIG.DEFAULT_SCALE);

			// Calculate position to center the current node at default scale
			const centerX =
				canvasWidth / 2 - currentNode.x * QUEST_MAP_CONFIG.DEFAULT_SCALE;
			const centerY =
				canvasHeight / 2 - currentNode.y * QUEST_MAP_CONFIG.DEFAULT_SCALE;

			setPosition({ x: centerX, y: centerY });
		}
	}, [nodes]);

	// Node interaction handlers
	const handleNodeMouseEnter = (index: number) => {
		setHoveredNode(index);
		// Unselect any selected node when hovering over a different node
		if (selectedNode !== null && selectedNode !== index) {
			setSelectedNode(null);
		}
	};

	const handleNodeMouseLeave = () => {
		setHoveredNode(null);
	};

	const handleNodeClick = (index: number) => {
		// Toggle selection - if clicking the same node, deselect it
		setSelectedNode(selectedNode === index ? null : index);
	};

	// Connection Renderer Component
	const QuestConnectionRenderer = ({ nodes }: { nodes: QuestNode[] }) => (
		<>
			{nodes.map((node) =>
				node.connections.map((targetId) => {
					const target = nodes.find((n) => n.id === targetId);
					if (!target) return null;

					const isTraversed = node.isCompleted;
					const isCurrent = node.isCurrent;

					const dx = target.x - node.x;
					const dy = target.y - node.y;
					const distance = Math.sqrt(dx * dx + dy * dy);
					const unitX = dx / distance;
					const unitY = dy / distance;

					const startX = node.x + unitX * 28;
					const startY = node.y + unitY * 28;
					const endX = target.x - unitX * 28;
					const endY = target.y - unitY * 28;

					// Calculate the progress percentage for the current level
					const progressPercentage =
						isCurrent && node.progressPercentage !== undefined
							? node.progressPercentage
							: isTraversed
								? 100
								: 0;

					// Calculate the end point based on progress
					const progressEndX =
						startX + (endX - startX) * (progressPercentage / 100);
					const progressEndY =
						startY + (endY - startY) * (progressPercentage / 100);

					return (
						<g key={`${node.id}-${targetId}`}>
							{/* Base connection line */}
							<line
								x1={startX}
								y1={startY}
								x2={endX}
								y2={endY}
								className={
									isTraversed
										? styles.connectionCompleted
										: styles.connectionDefault
								}
								strokeWidth="3"
								strokeLinecap="round"
							/>
							{/* Animated current progress line */}
							{isCurrent && (
								<>
									{/* Static progress line showing how far the player has progressed */}
									<line
										x1={startX}
										y1={startY}
										x2={progressEndX}
										y2={progressEndY}
										style={{ stroke: "var(--mantine-color-gold-filled)" }}
										strokeWidth="3"
										strokeLinecap="round"
										opacity="0.6"
									/>
									{/* Animated dashed overlay for the progressed portion */}
									<line
										x1={startX}
										y1={startY}
										x2={progressEndX}
										y2={progressEndY}
										className={`${styles.connectionCurrent} ${styles.connectionAnimated}`}
										strokeWidth="3"
										strokeLinecap="round"
									/>
								</>
							)}
						</g>
					);
				}),
			)}
		</>
	);

	// Color constants for better maintainability
	const NODE_COLORS = {
		GOLD: "var(--mantine-color-gold-filled)",
		// Completed levels take a paler gold, so the top level keeps the full one.
		SUBTLE_GOLD:
			"color-mix(in srgb, var(--mantine-color-gold-filled) 70%, var(--mantine-color-white))",
		BRAND_LIGHT: "var(--mantine-color-brand-4)",
		BRAND_DARK: "var(--mantine-color-brand-8)",
		GRAY: "var(--mantine-color-dark-3)",
	} as const;

	// Node Renderer Component - Refactored for readability
	const QuestNodeRenderer = ({
		node,
		nodeIndex,
		maxLevel,
		onMouseEnter,
		onMouseLeave,
		onClick,
	}: {
		node: QuestNode;
		nodeIndex: number;
		maxLevel: number | undefined;
		onMouseEnter: (index: number) => void;
		onMouseLeave: () => void;
		onClick: (index: number) => void;
	}) => {
		// Node state helpers
		const isHovered = hoveredNode === nodeIndex;
		const isMaxLevel = node.isCurrent && maxLevel && node.level === maxLevel;
		const isStartNode = node.level === 0;

		// Get node size based on completion status
		const nodeSize = node.isCompleted
			? QUEST_MAP_CONFIG.NODE_SIZES.completed
			: QUEST_MAP_CONFIG.NODE_SIZES.default;

		// Determine node state for CSS class
		const getNodeStateClass = () => {
			// Start node special cases
			if (isStartNode) {
				if (node.isCompleted) return styles.completed;
				if (node.isCurrent) return styles.current;
				return styles.start;
			}

			// Other nodes
			if (isMaxLevel) return styles.currentMax;
			if (node.isCurrent) return styles.current;
			if (node.isCompleted) return styles.completed;
			if (node.isAccessible) return styles.accessible;
			return styles.locked;
		};

		// Get color based on node state
		const getNodeColor = () => {
			if (isMaxLevel) return NODE_COLORS.GOLD;
			if (node.isCurrent) return NODE_COLORS.BRAND_LIGHT;
			if (node.isCompleted) return NODE_COLORS.SUBTLE_GOLD;
			if (node.isAccessible) return NODE_COLORS.BRAND_DARK;
			return NODE_COLORS.GRAY;
		};

		// Render appropriate icon based on node state
		const renderNodeIcon = () => {
			// Start node always shows flag
			if (isStartNode) {
				return <IconFlag size={16} />;
			}

			// Max level achieved - golden trophy
			if (isMaxLevel) {
				return <IconTrophy size={22} stroke={2.5} />;
			}

			// Other states
			if (node.isCompleted) {
				return <IconTrophy size={16} />;
			}
			if (node.isCurrent) {
				return <IconSparkles size={20} stroke={2.5} />;
			}
			if (!node.isAccessible) {
				return <IconLock size={16} />;
			}

			return <IconFlag size={16} />;
		};

		// Get the primary color for the node
		const nodeColor = getNodeColor();

		// Get color for pulsing effect (only for current nodes)
		const pulsingColor = isMaxLevel
			? NODE_COLORS.GOLD
			: NODE_COLORS.BRAND_LIGHT;

		return (
			// biome-ignore lint/a11y/useSemanticElements: an SVG <g> cannot be a <button>
			<g
				className={styles.questNodeGroup}
				onMouseEnter={() => onMouseEnter(nodeIndex)}
				onMouseLeave={onMouseLeave}
				onClick={() => onClick(nodeIndex)}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						onClick(nodeIndex);
					}
				}}
				style={{ cursor: node.isAccessible ? "pointer" : "default" }}
				tabIndex={node.isAccessible ? 0 : -1}
				role="button"
				aria-label={`${node.label} - ${node.isCompleted ? "Completed" : node.isCurrent ? "Current" : "Locked"}`}
			>
				{/* Invisible larger click area */}
				<circle
					cx={node.x}
					cy={node.y}
					r={nodeSize + 15}
					fill="transparent"
					style={{ cursor: node.isAccessible ? "pointer" : "default" }}
				/>

				{/* Hover glow effect */}
				{isHovered && (
					<>
						{/* Outer soft glow */}
						<circle
							cx={node.x}
							cy={node.y}
							r={nodeSize + 12}
							style={{ fill: nodeColor }}
							opacity="0.25"
							filter="blur(6px)"
						/>
						{/* Inner bright ring */}
						<circle
							cx={node.x}
							cy={node.y}
							r={nodeSize + 2}
							fill="none"
							style={{ stroke: nodeColor }}
							strokeWidth="2"
							opacity="0.8"
						/>
					</>
				)}

				{/* Pulsing glow for current node */}
				{node.isCurrent && (
					<>
						{/* Outer pulsing circle */}
						<circle
							cx={node.x}
							cy={node.y}
							r={nodeSize - 2}
							fill="none"
							style={{ stroke: pulsingColor }}
							strokeWidth="20"
							opacity="0.3"
							filter="blur(6px)"
						>
							<animate
								attributeName="opacity"
								values="0.1;0.3;0.1"
								dur="2s"
								repeatCount="indefinite"
							/>
						</circle>
						{/* Inner pulsing circle */}
						<circle
							cx={node.x}
							cy={node.y}
							r={nodeSize - 2}
							fill="none"
							style={{ stroke: pulsingColor }}
							strokeWidth="10"
							opacity="0.5"
							filter="blur(6px)"
						>
							<animate
								attributeName="opacity"
								values="0.3;0.5;0.3"
								dur="2s"
								repeatCount="indefinite"
							/>
						</circle>
					</>
				)}

				{/* Main node circle */}
				<circle
					cx={node.x}
					cy={node.y}
					r={nodeSize}
					className={`${styles.questNode} ${getNodeStateClass()}`}
					style={
						{
							"--node-x": `${node.x}px`,
							"--node-y": `${node.y}px`,
							transform: isHovered ? "scale(1.1)" : "scale(1)",
							transformOrigin: `${node.x}px ${node.y}px`,
						} as React.CSSProperties
					}
				/>

				{/* Node icon */}
				<foreignObject
					x={node.isCurrent ? node.x - 14 : node.x - 12}
					y={node.isCurrent ? node.y - 14 : node.y - 12}
					width={node.isCurrent ? 28 : 24}
					height={node.isCurrent ? 28 : 24}
					style={{ pointerEvents: "none" }}
				>
					<div className={styles.nodeIconContainer}>{renderNodeIcon()}</div>
				</foreignObject>

				{/* Node label */}
				<text
					x={node.x}
					y={node.y + 50}
					className={styles.nodeLabel}
					style={{ pointerEvents: "none" }}
				>
					{node.label}
				</text>
			</g>
		);
	};

	// Reward Card Renderer Component
	const RewardCardsRenderer: React.FC<RewardCardsRendererProps> = ({
		node,
		nodeIndex,
		questLevels,
		hoveredNode,
		selectedNode,
	}) => {
		// Skip start node (level 0) as it doesn't have items
		if (node.level === 0) return null;

		// Find the corresponding quest level data
		const questLevel = questLevels.find((level) => level.level === node.level);
		if (!questLevel?.items || questLevel.items.length === 0) return null;

		// Determine display mode for rewards
		const isHovered = hoveredNode === nodeIndex;
		const isSelected = selectedNode === nodeIndex;

		// Priority logic: if any node is hovered, only show that node's rewards
		// Otherwise, show selected node's rewards
		const showRewards = hoveredNode !== null ? isHovered : isSelected;

		if (!showRewards) return null;

		// Calculate opacity and scale based on display mode
		const getOpacity = (): number => {
			if (isHovered) return 1; // Full opacity when hovering (takes priority)
			if (isSelected) return 1; // Full opacity when selected
			return 0.5; // Fallback
		};

		const getScale = (): number => {
			if (isHovered) return 1; // Normal size when hovering
			if (isSelected) return 1; // Normal size when selected
			return 1; // Fallback
		};

		return (
			<g key={`rewards-${node.id}`}>
				{questLevel.items.map((item, itemIndex) => {
					// Calculate vertical position for stacked rewards using configured spacing
					const cardY =
						node.y -
						QUEST_MAP_CONFIG.CARD_VERTICAL_OFFSET -
						itemIndex * QUEST_MAP_CONFIG.CARD_VERTICAL_SPACING;
					const cardX = node.x;

					// Determine reward state
					const isItemAccessible = node.isAccessible || node.isCurrent;

					return (
						<g
							// biome-ignore lint/suspicious/noArrayIndexKey: reward items have no id
							key={`${node.id}-reward-${itemIndex}`}
							style={{
								transform: `scale(${getScale()})`,
								transformOrigin: `${cardX}px ${cardY}px`,
								transition: "transform 0.2s ease, opacity 0.2s ease",
							}}
						>
							<QuestRewardCard
								x={cardX}
								y={cardY}
								item={item}
								isAccessible={isItemAccessible}
								opacity={getOpacity()}
							/>
						</g>
					);
				})}
			</g>
		);
	};

	if (!quest) {
		return (
			<Box className={styles.loadingContainer}>
				<div className={styles.loadingText}>Loading quest data...</div>
			</Box>
		);
	}

	if (nodes.length === 0) {
		return (
			<Box className={styles.emptyContainer}>
				<div className={styles.emptyText}>No quest levels available</div>
			</Box>
		);
	}

	return (
		<Box className={styles.container}>
			{/* Fixed Background Layer */}
			<img
				src={questBackground}
				className={styles.backgroundLayer}
				alt="Quest Background"
			/>

			{/* Quest Title */}
			<img
				src={questBackgroundTitle}
				className={styles.questTitle}
				alt="Quest Title"
			/>

			{/* Info Badge */}
			<Paper className={styles.infoBadge} shadow="md" radius="md" p={6}>
				<Text size="xs" c="dimmed">
					Drag to move • Use +/- to zoom
				</Text>
				<Text size="xs" c="dimmed">
					Click nodes to view rewards
				</Text>
			</Paper>

			{/* Canvas Layer */}
			<Box
				ref={canvasRef}
				className={styles.canvas}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
			>
				{/* biome-ignore lint/a11y/noSvgWithoutTitle: This SVG is a decorative canvas for quest map visualization, not content that needs screen reader description */}
				<svg
					width={canvasDimensions.width}
					height={canvasDimensions.height}
					viewBox={`${canvasDimensions.minX} ${canvasDimensions.minY} ${canvasDimensions.width} ${canvasDimensions.height}`}
					className={`${styles.svg} ${styles.svgTransform} ${isDragging ? styles.svgDragging : ""}`}
					style={
						{
							"--pan-x": `${position.x}px`,
							"--pan-y": `${position.y}px`,
							"--scale": scale,
						} as React.CSSProperties
					}
				>
					{/* Draw connections between nodes */}
					<QuestConnectionRenderer nodes={nodes} />

					{/* Draw reward cards floating above nodes */}
					{nodes.map((node, idx) => (
						<RewardCardsRenderer
							key={node.id}
							node={node}
							nodeIndex={idx}
							questLevels={quest.levels}
							hoveredNode={hoveredNode}
							selectedNode={selectedNode}
						/>
					))}

					{/* Draw nodes */}
					{nodes.map((node, idx) => (
						<QuestNodeRenderer
							key={node.id}
							node={node}
							nodeIndex={idx}
							maxLevel={quest?.maxLevel}
							onMouseEnter={handleNodeMouseEnter}
							onMouseLeave={handleNodeMouseLeave}
							onClick={handleNodeClick}
						/>
					))}
				</svg>
			</Box>

			{/* Navigation Controls */}
			<Paper className={styles.navigationControls} shadow="lg">
				<Group gap="xs">
					<ActionIcon
						className={styles.centerButton}
						size="lg"
						onClick={handleCenterToCurrentNode}
						title="Center to current node"
					>
						<IconFocus2 size={20} />
					</ActionIcon>
					<ActionIcon
						className={styles.controlButton}
						size="lg"
						onClick={handleZoomIn}
						title="Zoom in"
					>
						<IconPlus size={20} />
					</ActionIcon>
					<ActionIcon
						className={styles.controlButton}
						size="lg"
						onClick={handleZoomOut}
						title="Zoom out"
					>
						<IconMinus size={20} />
					</ActionIcon>
				</Group>
			</Paper>
		</Box>
	);
};

export default QuestMapCanvas;
