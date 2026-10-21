import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { createPortal } from "react-dom";
import classes from "./confetti-burst.module.css";

gsap.registerPlugin(useGSAP);

const PIECE_COUNT = 70;
// The theme colours the pieces take in turn (see confetti-burst.module.css).
const TONES = ["gold", "neon", "brand", "silver", "bronze"] as const;

// The burst: each piece flies out from the middle, then falls and fades.
const BURST_SECONDS = 0.7;
const BURST_MIN_PX = 140;
const BURST_MAX_PX = 460;
// The burst leans upwards, so pieces arc over before they fall.
const BURST_LIFT_PX = 120;
const FALL_MIN_PX = 260;
const FALL_MAX_PX = 520;
const FALL_MIN_SECONDS = 1;
const FALL_MAX_SECONDS = 1.6;
const SPIN_DEGREES = 540;

// A short burst of confetti over the page, out from the middle of the jackpot win
// dialog. Shown only to players who don't reduce motion.
export function ConfettiBurst() {
	const burstRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const { random } = gsap.utils;
			for (const piece of gsap.utils.toArray<HTMLElement>(
				`.${classes.piece}`,
			)) {
				const angle = random(0, 2 * Math.PI);
				const distance = random(BURST_MIN_PX, BURST_MAX_PX);
				gsap
					.timeline()
					.to(piece, {
						x: Math.cos(angle) * distance,
						y: Math.sin(angle) * distance - BURST_LIFT_PX,
						rotation: random(-SPIN_DEGREES, SPIN_DEGREES),
						duration: BURST_SECONDS,
						ease: "power3.out",
					})
					.to(piece, {
						y: `+=${random(FALL_MIN_PX, FALL_MAX_PX)}`,
						rotation: `+=${random(-SPIN_DEGREES, SPIN_DEGREES)}`,
						opacity: 0,
						duration: random(FALL_MIN_SECONDS, FALL_MAX_SECONDS),
						ease: "power1.in",
					});
			}
		},
		{ scope: burstRef },
	);

	// Placed at the end of the page, so it sits over the dialog and its overlay.
	return createPortal(
		<div ref={burstRef} className={classes.burst} aria-hidden>
			{Array.from({ length: PIECE_COUNT }, (_, i) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: the pieces never reorder
					key={i}
					className={classes.piece}
					data-tone={TONES[i % TONES.length]}
				/>
			))}
		</div>,
		document.body,
	);
}
