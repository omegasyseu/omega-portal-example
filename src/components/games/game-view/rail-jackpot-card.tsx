import { Skeleton, Text } from "@mantine/core";
import { usePlayerJackpots } from "@/components/jackpot/hooks/use-player-jackpots.ts";
import { JackpotPanel } from "@/components/jackpot/jackpot-panel.tsx";
import classes from "./game-view.module.css";

const LOADING_HEIGHT = 160;

// The rail's Jackpot card: each jackpot's tiers, with Opt in or Opt out.
export function RailJackpotCard() {
	const { isLoggedIn, isLoading, jackpots } = usePlayerJackpots();

	if (isLoading) {
		return <Skeleton height={LOADING_HEIGHT} radius="lg" />;
	}
	if (jackpots.length === 0) {
		return (
			<section className={classes.card} aria-label="Jackpot">
				<Text className={classes.cardTitle}>Jackpot</Text>
				<Text className={classes.cardText}>
					No jackpot is running for you right now.
				</Text>
			</section>
		);
	}
	return jackpots.map((jackpot) => (
		<section
			key={jackpot.id}
			className={classes.card}
			aria-label={jackpot.name}
		>
			<JackpotPanel jackpot={jackpot} isLoggedIn={isLoggedIn} />
		</section>
	));
}
