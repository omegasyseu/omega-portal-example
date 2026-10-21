import { Button, Text, Title } from "@mantine/core";
import { useState } from "react";
import {
	findLimitSlot,
	LIMIT_TYPE_LABELS,
	minutesLabel,
	pendingSessionNote,
} from "@/components/responsible-gaming/limit-rows.ts";
import { PendingLimitNote } from "@/components/responsible-gaming/pending-limit-note.tsx";
import type { LimitQueue } from "@/components/responsible-gaming/use-limit-queue.ts";
import {
	type ResponsibleGamingLimit,
	SESSION_SETTING_PERIOD,
	type SessionSettingType,
} from "@/schemas-types/responsible-gaming";
import { PortalSelect } from "@/ui/form-inputs";
import classes from "./rg-limits.module.css";

const OFF = "off";
// The backend's default valid reality-check intervals, used for both settings.
const MINUTE_OPTIONS = [10, 20, 30, 40, 50, 60];

const COPY: Record<SessionSettingType, { hint: string; field: string }> = {
	SESSION_LIMIT: {
		hint: "The longest you can stay logged in at once.",
		field: "Length",
	},
	REALITY_CHECK: {
		hint: "A reminder of how long you've been playing.",
		field: "Every",
	},
};

// A value set elsewhere (e.g. by support) that isn't a standard option is still listed, so the dropdown can show it.
const buildOptions = (current?: number | null) => {
	const minutes =
		current && !MINUTE_OPTIONS.includes(current)
			? [...MINUTE_OPTIONS, current].sort((a, b) => a - b)
			: MINUTE_OPTIONS;
	return [
		{ value: OFF, label: "Off" },
		...minutes.map((value) => ({
			value: String(value),
			label: minutesLabel(value),
		})),
	];
};

type Props = {
	settingType: SessionSettingType;
	limits: ResponsibleGamingLimit[];
	queue: LimitQueue;
};

// Session Limit or Reality Check, in minutes. Shortening applies straight away;
// lengthening or turning it off waits for the Cool-down.
export function SessionSettingCard({ settingType, limits, queue }: Props) {
	const { active, pending } = findLimitSlot(
		limits,
		settingType,
		SESSION_SETTING_PERIOD,
	);
	const saved = active?.limit ? String(active.limit) : OFF;
	const [selected, setSelected] = useState(saved);
	const label = LIMIT_TYPE_LABELS[settingType];
	const titleId = `rg-${settingType}`;

	const save = () =>
		queue.saveAll([
			{
				limitType: settingType,
				periodType: SESSION_SETTING_PERIOD,
				limit: selected === OFF ? null : Number(selected),
			},
		]);

	return (
		<section className={classes.card} aria-labelledby={titleId}>
			<div className={classes.cardHead}>
				<div>
					<Title order={3} id={titleId} className={classes.cardTitle}>
						{label}
					</Title>
					<Text className={classes.hint}>{COPY[settingType].hint}</Text>
				</div>
				<Button
					variant="default"
					onClick={save}
					loading={queue.isSaving(settingType)}
					disabled={
						selected === saved || (queue.isBusy && !queue.isSaving(settingType))
					}
				>
					Save
				</Button>
			</div>
			<div className={classes.period}>
				<PortalSelect
					label={COPY[settingType].field}
					data={buildOptions(active?.limit)}
					value={selected}
					onChange={(value) => setSelected(value ?? OFF)}
					allowDeselect={false}
				/>
			</div>
			{pending ? (
				<div className={classes.notices}>
					<PendingLimitNote note={pendingSessionNote(pending)} />
				</div>
			) : null}
		</section>
	);
}
