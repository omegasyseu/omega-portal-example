import { Group } from "@mantine/core";
import { useForceUpdate, useInterval } from "@mantine/hooks";
import { IconHourglass } from "@tabler/icons-react";
import { calculateTimeRemaining } from "@/utils/date.ts";
import classes from "./challenges.module.css";

const TICK_MS = 1000;
const TIME_ICON_SIZE = 14;

// Counts down to the end date, ticking every second. Undefined when the date can't be read.
const useTimeLeft = (endDate: string) => {
	const tick = useForceUpdate();
	useInterval(tick, TICK_MS, { autoInvoke: true });
	const remaining = calculateTimeRemaining(endDate);
	return Number.isNaN(remaining.totalSeconds)
		? undefined
		: remaining.formattedString;
};

// A challenge's time left, from its IPS end date; hidden when the date can't be read.
export function ChallengeTimeLeft({ endDate }: { endDate: string }) {
	const timeLeft = useTimeLeft(endDate);
	if (!timeLeft) {
		return null;
	}
	return (
		<div className={classes.timeLeft}>
			<Group gap={4} wrap="nowrap">
				<IconHourglass size={TIME_ICON_SIZE} aria-hidden />
				Time left
			</Group>
			<span>{timeLeft}</span>
		</div>
	);
}
