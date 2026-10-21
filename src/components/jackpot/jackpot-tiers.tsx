import { Skeleton, Text } from "@mantine/core";
import {
	IconCoin,
	IconCoins,
	IconDiamond,
	IconPigMoney,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { formatNumByCurrency } from "@/hooks/use-format/fomatCurrencySymbol";
import classes from "./jackpot-tiers.module.css";

dayjs.extend(relativeTime);

// A tier's live value can be missing until the feed's first message arrives.
export type JackpotTier = { name: string; value?: number; lastWon?: string };

// Tiers come lowest first (Bronze, Silver, Gold, Platinum); each gets its own icon, and
// its colour from its position in the CSS, repeating if a jackpot has more.
const TIER_ICONS = [IconCoin, IconCoins, IconPigMoney, IconDiamond] as const;

const TIER_ICON_SIZE = 32;
const PLACEHOLDER_TIERS = TIER_ICONS.length;
const TIER_SKELETON_HEIGHT = 128;
const VALUE_SKELETON_HEIGHT = 24;
const VALUE_SKELETON_WIDTH = 80;

const Tier = ({
	tier,
	index,
	currency,
	valuesPending,
}: {
	tier: JackpotTier;
	index: number;
	currency: string;
	valuesPending: boolean;
}) => {
	const Icon = TIER_ICONS[index % TIER_ICONS.length];
	return (
		<li className={classes.tier}>
			<Icon size={TIER_ICON_SIZE} className={classes.tierIcon} aria-hidden />
			<Text className={classes.tierName}>{tier.name}</Text>
			{tier.value === undefined ? (
				// No live value: claim nothing about the amount or the last win.
				valuesPending ? (
					<Skeleton
						height={VALUE_SKELETON_HEIGHT}
						width={VALUE_SKELETON_WIDTH}
						aria-label="Loading"
					/>
				) : (
					<Text className={classes.tierValue}>–</Text>
				)
			) : (
				<>
					<Text className={classes.tierValue}>
						{formatNumByCurrency(tier.value, currency)}
					</Text>
					<Text className={classes.tierWon}>
						{tier.lastWon
							? `Last won ${dayjs(tier.lastWon).fromNow()}`
							: "Not won yet"}
					</Text>
				</>
			)}
		</li>
	);
};

type Props = {
	// Undefined while loading, which shows placeholders.
	tiers?: readonly JackpotTier[];
	// The feed may still send values that are missing; until then they show placeholders.
	valuesPending?: boolean;
	currency: string;
	// The list's layout: a scrolling row or a grid, set by the page.
	className: string;
	// Small left-aligned tiles, as in Omega Wins' game rail; otherwise large centred ones.
	compact?: boolean;
};

// A jackpot's tiers with their live values and when each was last won.
export function JackpotTiers({
	tiers,
	currency,
	className,
	valuesPending = false,
	compact = false,
}: Props) {
	return (
		<ul
			className={className}
			aria-busy={!tiers}
			data-compact={compact || undefined}
		>
			{tiers
				? tiers.map((tier, index) => (
						<Tier
							key={tier.name}
							tier={tier}
							index={index}
							currency={currency}
							valuesPending={valuesPending}
						/>
					))
				: Array.from({ length: PLACEHOLDER_TIERS }, (_, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: placeholders have no identity
						<li key={index}>
							<Skeleton height={TIER_SKELETON_HEIGHT} radius="lg" />
						</li>
					))}
		</ul>
	);
}
