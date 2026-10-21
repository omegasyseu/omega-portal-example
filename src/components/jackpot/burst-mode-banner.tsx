import { Progress, Text } from "@mantine/core";
import { IconFlame } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import type { BurstModeType } from "@/schemas-types";
import classes from "./jackpot-panel.module.css";

const SECONDS_PER_MINUTE = 60;
const TICK_MS = 1000;
const BURST_ICON_SIZE = 16;

const formatCountdown = (totalSeconds: number): string => {
	const s = Math.max(0, Math.floor(totalSeconds));
	const mm = Math.floor(s / SECONDS_PER_MINUTE)
		.toString()
		.padStart(2, "0");
	const ss = (s % SECONDS_PER_MINUTE).toString().padStart(2, "0");
	return `${mm}:${ss}`;
};

// Counts down a burst's remaining minutes, ticking every second between feed updates.
const useBurstCountdown = (burstMode?: BurstModeType) => {
	const [remainingSeconds, setRemainingSeconds] = useState(0);
	const endTimeRef = useRef(0);
	const totalSecondsRef = useRef(0);
	const minutesRemaining = burstMode?.minutesRemaining ?? 0;

	useEffect(() => {
		if (!burstMode?.active) {
			setRemainingSeconds(0);
			endTimeRef.current = 0;
			totalSecondsRef.current = 0;
			return;
		}
		const initialSeconds = Math.max(0, minutesRemaining * SECONDS_PER_MINUTE);
		endTimeRef.current = Date.now() + initialSeconds * TICK_MS;
		// Anchor the progress bar to the largest window seen so updates
		// from the websocket don't cause the bar to visually jump forward.
		if (initialSeconds > totalSecondsRef.current) {
			totalSecondsRef.current = initialSeconds;
		}
		setRemainingSeconds(initialSeconds);

		const tick = () => {
			setRemainingSeconds(
				Math.max(0, (endTimeRef.current - Date.now()) / TICK_MS),
			);
		};
		const interval = setInterval(tick, TICK_MS);
		return () => clearInterval(interval);
	}, [burstMode?.active, minutesRemaining]);

	const progress =
		totalSecondsRef.current > 0
			? Math.min(1, Math.max(0, remainingSeconds / totalSecondsRef.current))
			: 0;

	return { remainingSeconds, progress };
};

// While a jackpot's burst mode runs: its countdown and a bar of the time left.
export function BurstModeBanner({ burstMode }: { burstMode?: BurstModeType }) {
	const { remainingSeconds, progress } = useBurstCountdown(burstMode);

	if (!burstMode?.active || remainingSeconds <= 0) {
		return null;
	}
	return (
		<div className={classes.burst}>
			<div className={classes.burstRow}>
				<Text component="span" className={classes.burstTitle}>
					<IconFlame size={BURST_ICON_SIZE} aria-hidden />
					Burst Mode
				</Text>
				<Text component="span" className={classes.burstTime}>
					Ends in {formatCountdown(remainingSeconds)}
				</Text>
			</div>
			<Progress
				value={progress * 100}
				size="xs"
				color="neon"
				aria-label="Burst mode time left"
			/>
		</div>
	);
}
