import { Button, Text } from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import { MotionConfig, motion } from "motion/react";
import { useState } from "react";
import { PortalModal } from "@/components/route-modal";
import { formatNumByCurrency } from "@/hooks/use-format/fomatCurrencySymbol";
import type { JackpotEventType } from "@/server/IPS/ps-jackpot-event";
import { ConfettiBurst } from "./confetti-burst.tsx";
import { jackpotWheel } from "./jackpot-wheel.ts";
import classes from "./jackpot-win-dialog.module.css";
import { PrizeWheel, type WheelPhase } from "./prize-wheel.tsx";

export type JackpotWin = NonNullable<JackpotEventType>;

const BUTTON_LABEL: Record<WheelPhase, string> = {
	ready: "Spin",
	spinning: "Spinning…",
	won: "Keep playing",
};

// Room for the wheel at full size; narrower screens scale it down.
const DIALOG_WIDTH = 420;

// The prize rises into place once the wheel stops.
const PRIZE_ENTER = { opacity: 0, y: 12, scale: 0.94 };
const PRIZE_SHOWN = { opacity: 1, y: 0, scale: 1 };
const PRIZE_SPRING = { type: "spring", stiffness: 320, damping: 22 } as const;

// The prize in the win's currency; a value that isn't a plain number shows as sent.
const prizeLabel = ({ winValue, currency }: JackpotWin) => {
	const amount = Number(winValue);
	return Number.isFinite(amount)
		? formatNumByCurrency(amount, currency)
		: `${winValue} ${currency}`;
};

type Props = {
	win: JackpotWin;
	onClose: () => void;
};

// One jackpot win: the wheel with Spin, then, once it stops, the prize in the same
// dialog. It closes at any point (the prize is paid either way, and a run of wins
// mustn't trap the player), which moves on to the next win waiting.
export default function JackpotWinDialog({ win, onClose }: Props) {
	const isMotionReduced = useReducedMotion();
	const [phase, setPhase] = useState<WheelPhase>("ready");
	const { tiers, prizeIndex } = jackpotWheel(win.availableTiers, win.tier);

	return (
		// Motion leaves out movement for players who reduce motion.
		<MotionConfig reducedMotion="user">
			<PortalModal opened onClose={onClose} title="Jackpot" size={DIALOG_WIDTH}>
				<div className={classes.body}>
					<Text className={classes.lead}>
						You&#39;ve hit a jackpot.
						{phase === "won" ? null : " Spin the wheel to see which one."}
					</Text>
					<PrizeWheel
						tiers={tiers}
						prizeIndex={prizeIndex}
						phase={phase}
						onStop={() => setPhase("won")}
					/>
					{/* Announced when the wheel stops. */}
					<div className={classes.result} aria-live="polite">
						{phase === "won" ? (
							<motion.div
								className={classes.prize}
								initial={PRIZE_ENTER}
								animate={PRIZE_SHOWN}
								transition={PRIZE_SPRING}
							>
								<Text className={classes.resultTier}>
									You won the {win.tier.trim()} jackpot
								</Text>
								<Text className={classes.resultAmount}>{prizeLabel(win)}</Text>
							</motion.div>
						) : null}
					</div>
					{/* One button, Spin then Keep playing, so focus stays on it. While the wheel
					    turns it only looks disabled: a disabled button would drop focus. */}
					<Button
						size="md"
						fullWidth
						data-autofocus
						data-disabled={phase === "spinning" || undefined}
						aria-disabled={phase === "spinning"}
						onClick={() => {
							if (phase === "ready") setPhase("spinning");
							if (phase === "won") onClose();
						}}
					>
						{BUTTON_LABEL[phase]}
					</Button>
				</div>
			</PortalModal>
			{phase === "won" && !isMotionReduced ? <ConfettiBurst /> : null}
		</MotionConfig>
	);
}
