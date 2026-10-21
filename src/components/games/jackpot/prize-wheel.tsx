import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@mantine/hooks";
import gsap from "gsap";
import { useRef, useState } from "react";
import {
	isLabelFlipped,
	landingRotation,
	MAX_LANDING_OFFSET,
	segmentPath,
	tierTone,
} from "./jackpot-wheel.ts";
import classes from "./prize-wheel.module.css";

gsap.registerPlugin(useGSAP);

// Where a win is: the wheel waiting for Spin, turning, or stopped on the prize.
export type WheelPhase = "ready" | "spinning" | "won";

// The wheel is drawn in a 200-unit box; the rim and pointer sit just outside it.
const RADIUS = 100;
const FRAME = 10;
const VIEW_BOX = `${-FRAME} ${-FRAME} ${2 * (RADIUS + FRAME)} ${2 * (RADIUS + FRAME)}`;
const RIM_RADIUS = RADIUS + FRAME / 2;
// Each tier's colour is a band at the rim this deep; the segment inside it is dark.
const BAND_DEPTH = 9;
// The tier names lie along their segment's middle, centred this far out.
const LABEL_RADIUS = 54;
// The pointer: a rounded wedge over the rim at the top, its tip just inside the wheel.
const POINTER_HALF_WIDTH = 10;
const POINTER_TOP = -FRAME - 2;
const POINTER_TIP = 12;

// A long spin with a slow, settling finish.
const SPIN_SECONDS = 5;
const SPIN_TURNS = 6;
const SPIN_EASE = "power4.out";

type Props = {
	tiers: readonly string[];
	prizeIndex: number;
	// Spinning starts the turn, which runs once; won picks out the prize's segment.
	phase: WheelPhase;
	onStop: () => void;
};

// The jackpot prize wheel: a dark segment per tier, edged in that tier's colour, turned
// by GSAP so the won tier stops under the pointer at the top. Players who reduce motion
// see it land without turning.
export function PrizeWheel({ tiers, prizeIndex, phase, onStop }: Props) {
	const rotorRef = useRef<SVGGElement>(null);
	const isMotionReduced = useReducedMotion();
	// Where in the won segment it stops, picked once so a re-render doesn't move it.
	const [drift] = useState(() => (Math.random() * 2 - 1) * MAX_LANDING_OFFSET);
	// Where the wheel rests, or will once the spin ends, so the labels read the right
	// way up there.
	const [restingRotation, setRestingRotation] = useState(0);
	const isSpinning = phase === "spinning";
	const segment = 360 / tiers.length;

	useGSAP(
		() => {
			if (!isSpinning) {
				return;
			}
			const rotation = landingRotation(prizeIndex, tiers.length, {
				turns: SPIN_TURNS,
				offset: drift,
			});
			// Labels turn to read the right way up where the wheel will rest now, while
			// it's a blur, rather than jumping round as it stops.
			setRestingRotation(rotation);
			gsap.to(rotorRef.current, {
				rotation,
				svgOrigin: `${RADIUS} ${RADIUS}`,
				duration: isMotionReduced ? 0 : SPIN_SECONDS,
				ease: SPIN_EASE,
				onComplete: onStop,
			});
		},
		{ dependencies: [isSpinning] },
	);

	return (
		<svg
			viewBox={VIEW_BOX}
			className={classes.wheel}
			role="img"
			aria-label={`Prize wheel: ${tiers.join(", ")}`}
		>
			<circle cx={RADIUS} cy={RADIUS} r={RIM_RADIUS} className={classes.rim} />
			<g ref={rotorRef}>
				{tiers.map((tier, i) => {
					const middle = (i + 0.5) * segment;
					const isFlipped = isLabelFlipped(middle, restingRotation);
					return (
						<g
							key={tier}
							data-tone={tierTone(tier, i)}
							// Alternate segments take the lighter dark, so neighbours part.
							data-alternate={i % 2 === 1 || undefined}
							// Once it lands, the prize's segment lights up and the rest step back.
							data-won={(phase === "won" && i === prizeIndex) || undefined}
							data-dimmed={(phase === "won" && i !== prizeIndex) || undefined}
							className={classes.tier}
						>
							<path
								d={segmentPath(i, tiers.length, RADIUS)}
								className={classes.band}
							/>
							<path
								d={segmentPath(i, tiers.length, RADIUS - BAND_DEPTH, RADIUS)}
								className={classes.segment}
							/>
							{/* Turned to its segment's middle, then laid along it, reading left
							    to right. */}
							<text
								x={RADIUS}
								y={RADIUS - LABEL_RADIUS}
								transform={`rotate(${middle} ${RADIUS} ${RADIUS}) rotate(${isFlipped ? 90 : -90} ${RADIUS} ${RADIUS - LABEL_RADIUS})`}
								className={classes.label}
							>
								{tier}
							</text>
						</g>
					);
				})}
			</g>
			<path
				d={`M${RADIUS - POINTER_HALF_WIDTH} ${POINTER_TOP} L${RADIUS + POINTER_HALF_WIDTH} ${POINTER_TOP} L${RADIUS} ${POINTER_TIP} Z`}
				className={classes.pointer}
			/>
		</svg>
	);
}
