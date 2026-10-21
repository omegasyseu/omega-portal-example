import { Button, Loader, Stack, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { LimitCodeModal } from "@/components/responsible-gaming/limit-code-step.tsx";
import {
	findLimitSlot,
	formatAmount,
	LIMIT_TYPE_LABELS,
	minutesLabel,
	type UnsavedLimitFields,
} from "@/components/responsible-gaming/limit-rows.ts";
import { MoneyLimitCard } from "@/components/responsible-gaming/money-limit-card.tsx";
import SelfExclusionPanel from "@/components/responsible-gaming/self-exclusion-panel.tsx";
import { SessionSettingCard } from "@/components/responsible-gaming/session-setting-card.tsx";
import { useLimitQueue } from "@/components/responsible-gaming/use-limit-queue.ts";
import { usePrimaryAccount } from "@/hooks/use-primary-account";
import {
	MONEY_LIMIT_TYPES,
	type ResponsibleGamingLimit,
	SESSION_SETTING_TYPES,
	type SessionSettingType,
} from "@/schemas-types/responsible-gaming";
import { useGetResponsibleGamingLimits } from "@/server/IPS/responsible-gaming/get-responsible-gaming-limits.ts";
import type { LimitChange } from "@/server/IPS/responsible-gaming/update-responsible-gaming-limit.tsx";
import classes from "./rg-limits.module.css";

const isSessionSetting = (
	limitType: LimitChange["limitType"],
): limitType is SessionSettingType =>
	(SESSION_SETTING_TYPES as readonly string[]).includes(limitType);

// A card is keyed by its saved rows, so its fields reset once a save has been fetched
// again. While a Save is still sending its changes, the keys hold still: resetting then
// would drop the periods not yet sent and the errors meant for them. A Save that stops on
// an error after some changes saved still resets its card, so the card starts again from
// the amounts and error that weren't saved.
// Only the limits themselves count: usage changes after every bet and mustn't reset a
// card the player is typing in.
const cardKey = (limits: ResponsibleGamingLimit[], limitType: string) =>
	[
		limitType,
		...limits
			.filter((limit) => limit.limitType === limitType)
			.map(
				({ responsibleGamingLimitID, periodType, status, limit }) =>
					`${responsibleGamingLimitID}:${periodType}:${status}:${limit ?? "none"}`,
			),
	].join("|");

// The "you are changing" row the security-code step shows.
const describeChange =
	(limits: ResponsibleGamingLimit[], currency?: string) =>
	(change: LimitChange) => {
		const { active } = findLimitSlot(
			limits,
			change.limitType,
			change.periodType,
		);
		if (isSessionSetting(change.limitType)) {
			return {
				label: LIMIT_TYPE_LABELS[change.limitType],
				from: minutesLabel(active?.limit),
				to: minutesLabel(change.limit),
			};
		}
		return {
			label: `${change.periodType} ${LIMIT_TYPE_LABELS[change.limitType].toLowerCase()}`,
			from: formatAmount(active?.limit, currency),
			to:
				change.limit === null
					? "Removed"
					: formatAmount(change.limit, currency),
		};
	};

const LimitCards = ({ limits }: { limits: ResponsibleGamingLimit[] }) => {
	const { currency } = usePrimaryAccount();
	const queue = useLimitQueue();
	const [keyedLimits, setKeyedLimits] = useState(limits);
	const [unsaved, setUnsaved] = useState<UnsavedLimitFields | null>(null);
	useEffect(() => {
		if (!queue.isBusy) {
			setKeyedLimits(limits);
		}
	}, [limits, queue.isBusy]);
	const moneyCard = (limitType: (typeof MONEY_LIMIT_TYPES)[number]) => (
		<MoneyLimitCard
			key={cardKey(keyedLimits, limitType)}
			limitType={limitType}
			limits={limits}
			currency={currency}
			queue={queue}
			unsaved={unsaved?.limitType === limitType ? unsaved : null}
			onUnsavedChange={setUnsaved}
		/>
	);

	return (
		<>
			<LimitCodeModal
				step={queue.codeStep}
				describe={describeChange(limits, currency)}
			/>
			{/* Cards in a row share their header, field and notice bands, so they line up. */}
			<div className={classes.grid}>
				{MONEY_LIMIT_TYPES.map(moneyCard)}
				<div className={classes.pair}>
					{SESSION_SETTING_TYPES.map((settingType) => (
						<SessionSettingCard
							key={cardKey(keyedLimits, settingType)}
							settingType={settingType}
							limits={limits}
							queue={queue}
						/>
					))}
				</div>
			</div>
		</>
	);
};

const LimitsLoader = () => {
	const {
		data: limits,
		isLoading,
		isError,
		refetch,
	} = useGetResponsibleGamingLimits();

	if (isLoading) {
		return <Loader size="sm" aria-label="Loading your limits" />;
	}
	if (isError || !limits) {
		return (
			<Stack gap="sm" align="flex-start">
				<Text className={classes.hint}>
					Your limits couldn&#39;t be loaded. Check your connection and try
					again.
				</Text>
				<Button variant="default" size="xs" onClick={() => refetch()}>
					Try again
				</Button>
			</Stack>
		);
	}
	return <LimitCards limits={limits} />;
};

// The Responsible Gaming tab: a card per RG Limit type, then Self-exclusion (approved
// mockup, ticket 10).
export function RgLimits() {
	return (
		<div className={classes.tab}>
			<div className={classes.intro}>
				<div>
					<Title order={2} className={classes.title}>
						RG Limits
					</Title>
					<Text className={classes.lead}>
						Limits apply to your Primary Account in every currency. Lowering a
						limit applies straight away. Raising or removing one waits for a
						Cool-down, and shows as a Pending Limit under its card until then.
					</Text>
				</div>
				<Text className={classes.hint}>
					Saving may ask for a security code we send you.
				</Text>
			</div>
			<LimitsLoader />
			<SelfExclusionPanel />
		</div>
	);
}
