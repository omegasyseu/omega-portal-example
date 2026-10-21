import { useEffect, useState } from "react";

// How long a player waits after a code is sent before asking for another, as on Omega
// Wins: the wait starts when the code step opens, not after the first resend.
const RESEND_COOLDOWN_MS = 30_000;

const TICK_MS = 1000;

// Measured from when the code was sent rather than counted down tick by tick, so a page
// left in the background (a player checking their mail app) catches up on return.
export const secondsUntilResend = (sentAt: number, now: number) =>
	Math.max(Math.ceil((sentAt + RESEND_COOLDOWN_MS - now) / 1000), 0);

export const resendLabel = (secondsLeft: number) =>
	secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend code";

// Counts down from the moment the code step mounts; `restart` begins a new wait once
// another code has gone out.
export const useResendCooldown = () => {
	const [sentAt, setSentAt] = useState(() => Date.now());
	const [secondsLeft, setSecondsLeft] = useState(() =>
		secondsUntilResend(sentAt, sentAt),
	);
	const isWaiting = secondsLeft > 0;

	useEffect(() => {
		if (!isWaiting) return;
		const timer = setInterval(
			() => setSecondsLeft(secondsUntilResend(sentAt, Date.now())),
			TICK_MS,
		);
		return () => clearInterval(timer);
	}, [isWaiting, sentAt]);

	return {
		secondsLeft,
		isWaiting,
		restart: () => {
			const now = Date.now();
			setSentAt(now);
			setSecondsLeft(secondsUntilResend(now, now));
		},
	};
};
