import { useEffect, useState } from "react";
import type { z } from "zod";
import { useShownBrandId } from "@/providers/brand-content/brand-content-provider.tsx";
import { JackpotDataFeed } from "@/schemas-types";
import { useAmsJackpotEvent } from "@/server/AMS/ams-jackpot-event.ts";

// Only the fields the portal shows.
const LiveJackpotSchema = JackpotDataFeed.pick({
	id: true,
	brandId: true,
	name: true,
	baseCurrency: true,
	tiers: true,
	burstMode: true,
});

export type LiveJackpot = z.infer<typeof LiveJackpotSchema>;

// The feed sends every few seconds; a brand that has sent nothing by then has no jackpot.
const FEED_WAIT_MS = 10_000;

const isForBrand = (brandId: string) => (jackpot: LiveJackpot) =>
	`${jackpot.brandId}` === brandId;

// The latest values of every jackpot the AMS feed sends for the Selected Brand: the feed
// sends tier values without a session (checked in ticket 06). Jackpots keep the order
// they were first seen in. `isWaiting` holds until the first message, or until the
// brand has had time to send one.
export const useLiveJackpots = () => {
	const brandId = useShownBrandId();
	const { lastJsonMessage } = useAmsJackpotEvent(brandId);
	const [jackpots, setJackpots] = useState<LiveJackpot[]>([]);
	const [waitedForBrand, setWaitedForBrand] = useState<string>();

	useEffect(() => {
		const timer = setTimeout(() => setWaitedForBrand(brandId), FEED_WAIT_MS);
		return () => clearTimeout(timer);
	}, [brandId]);

	useEffect(() => {
		const parsed = LiveJackpotSchema.safeParse(lastJsonMessage);
		// A message from the previous brand's socket can arrive after logging in or out.
		if (!parsed.success || !isForBrand(brandId)(parsed.data)) {
			return;
		}
		const update = parsed.data;
		setJackpots((shown) => {
			const current = shown.filter(isForBrand(brandId));
			return current.some(({ id }) => id === update.id)
				? current.map((jackpot) =>
						jackpot.id === update.id ? update : jackpot,
					)
				: [...current, update];
		});
	}, [lastJsonMessage, brandId]);

	const current = jackpots.filter(isForBrand(brandId));
	const hasWaitedLongEnough = waitedForBrand === brandId;
	return {
		jackpots: current,
		isWaiting: current.length === 0 && !hasWaitedLongEnough,
		// The feed has had its time; a jackpot it hasn't sent yet won't come.
		hasWaitedLongEnough,
	};
};
