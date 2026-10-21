import { Image, Skeleton, Text } from "@mantine/core";
import { usePlayerJackpots } from "@/components/jackpot/hooks/use-player-jackpots.ts";
import { JackpotPanel } from "@/components/jackpot/jackpot-panel.tsx";
import classes from "./jackpot-modal.module.css";

const JACKPOT_ART = "/backgrounds/jackpot-portrait.avif";
const LOADING_HEIGHT = 320;

// The Jackpot dialog, as on Omega Wins: our art beside the player's jackpots, each with
// its tiers and Opt in or Opt out.
export function JackpotModalContent() {
	const { isLoggedIn, isLoading, jackpots } = usePlayerJackpots();

	return (
		<div className={classes.layout}>
			<Image
				src={JACKPOT_ART}
				alt=""
				visibleFrom="sm"
				className={classes.art}
			/>
			<div className={classes.jackpots}>
				<Text className={classes.lead}>
					Join a jackpot and every bet you play can win a tier.
				</Text>
				{isLoading ? (
					<Skeleton height={LOADING_HEIGHT} radius="lg" />
				) : jackpots.length === 0 ? (
					<Text className={classes.lead}>
						No jackpot is running for you right now.
					</Text>
				) : (
					jackpots.map((jackpot) => (
						<JackpotPanel
							key={jackpot.id}
							jackpot={jackpot}
							isLoggedIn={isLoggedIn}
							headingOrder={3}
						/>
					))
				)}
			</div>
		</div>
	);
}
