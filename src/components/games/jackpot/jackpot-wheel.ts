// The prize wheel for a jackpot win: a segment per tier in the event's comma-separated
// list (each once), and the segment the spin stops on. The won tier is added when the
// list leaves it out, so the wheel always lands on what was won.
export const jackpotWheel = (availableTiers: string, wonTier: string) => {
	const won = wonTier.trim();
	const listed = [
		...new Set(
			availableTiers
				.split(",")
				.map((tier) => tier.trim())
				.filter((tier) => tier !== ""),
		),
	];
	const tiers = listed.includes(won) ? listed : [...listed, won];
	return { tiers, prizeIndex: tiers.indexOf(won) };
};

type Landing = {
	// Whole turns before it settles.
	turns: number;
	// Where in the segment it stops, as a fraction of the segment either side of its
	// middle: 0 is dead centre.
	offset?: number;
};

// The furthest a landing may drift from the middle, as a fraction of the segment, so
// the pointer stays well clear of the line into the next one.
export const MAX_LANDING_OFFSET = 0.3;

// How far to turn the wheel, clockwise in degrees, so the won segment stops under the
// pointer at the top. Segments are laid clockwise from the top.
export const landingRotation = (
	prizeIndex: number,
	segmentCount: number,
	{ turns, offset = 0 }: Landing,
) => {
	const segment = 360 / segmentCount;
	const drift = Math.min(
		Math.max(offset, -MAX_LANDING_OFFSET),
		MAX_LANDING_OFFSET,
	);
	return turns * 360 - (prizeIndex + 0.5 + drift) * segment;
};

// A point on a circle about (centre, centre), at an angle clockwise from the top,
// rounded for the path.
const pointAt = (angle: number, radius: number, centre: number) => {
	const radians = (angle * Math.PI) / 180;
	const round = (value: number) => Number(value.toFixed(2));
	return `${round(centre + radius * Math.sin(radians))} ${round(centre - radius * Math.cos(radians))}`;
};

// The SVG path of one segment of a wheel of the given radius: a slice from the centre,
// laid clockwise from the top. The centre defaults to (radius, radius), the wheel drawn
// in a box twice its size; a smaller slice round the same centre makes the inside of a
// band. A wheel of one segment is the whole circle.
export const segmentPath = (
	index: number,
	segmentCount: number,
	radius: number,
	centre = radius,
) => {
	const arc = `A${radius} ${radius} 0`;
	const at = (angle: number) => pointAt(angle, radius, centre);
	if (segmentCount === 1) {
		return `M${at(0)} ${arc} 1 1 ${at(180)} ${arc} 1 1 ${at(0)} Z`;
	}
	const segment = 360 / segmentCount;
	const isLarge = segment > 180 ? 1 : 0;
	return `M${centre} ${centre} L${at(index * segment)} ${arc} ${isLarge} 1 ${at((index + 1) * segment)} Z`;
};

// The wheel's colours, one per tier, lowest first as the jackpot card has them (see
// prize-wheel.module.css).
const TONES = ["bronze", "silver", "gold", "platinum"] as const;
export type TierTone = (typeof TONES)[number];

// A tier's colour on the wheel: its own for the tiers named after one, otherwise the
// tones in turn by position, as the jackpot card colours its tiers.
export const tierTone = (tier: string, index: number): TierTone => {
	const name = tier.trim().toLowerCase();
	return TONES.find((tone) => tone === name) ?? TONES[index % TONES.length];
};

// Whether a label laid along its segment's middle (at an angle clockwise from the top)
// should be turned round to read left to right: it reads out from the hub on the
// wheel's right half and would be upside down on the left. Judged where the wheel rests.
export const isLabelFlipped = (middle: number, rotation: number) => {
	const onScreen = (((middle + rotation) % 360) + 360) % 360;
	return onScreen > 180;
};
