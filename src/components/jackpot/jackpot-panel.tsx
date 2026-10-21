import { Button, Title } from "@mantine/core";
import { useSendToSignIn } from "@/components/auth/hooks/use-send-to-sign-in.ts";
import { BurstModeBanner } from "@/components/jackpot/burst-mode-banner.tsx";
import { useOptJackpot } from "@/components/jackpot/hooks/use-opt-jackpot.tsx";
import type { PlayerJackpot } from "@/components/jackpot/hooks/use-player-jackpots.ts";
import { JackpotTiers } from "@/components/jackpot/jackpot-tiers.tsx";
import classes from "./jackpot-panel.module.css";

type Props = {
	jackpot: PlayerJackpot;
	isLoggedIn: boolean;
	// The name's heading level: 2 in the game rail, 3 under the Jackpot dialog's title.
	headingOrder?: 2 | 3;
};

// One jackpot: its name, burst mode while it runs, the tiers in a compact 2×2 grid, and Opt
// in or Opt out. Opting in sends a visitor to sign in first.
export function JackpotPanel({ jackpot, isLoggedIn, headingOrder = 2 }: Props) {
	const optJackpot = useOptJackpot();
	const sendToSignIn = useSendToSignIn();

	return (
		<div className={classes.panel}>
			<Title order={headingOrder} className={classes.name}>
				{jackpot.name}
			</Title>
			<BurstModeBanner burstMode={jackpot.burstMode} />
			<JackpotTiers
				tiers={jackpot.tiers}
				currency={jackpot.baseCurrency}
				className={classes.tiers}
				valuesPending={jackpot.valuesPending}
				compact
			/>
			<Button
				fullWidth
				variant={jackpot.optIn ? "default" : "filled"}
				loading={optJackpot.isPending}
				onClick={() =>
					isLoggedIn
						? optJackpot.mutate({
								checked: !jackpot.optIn,
								jackpotId: jackpot.id,
							})
						: void sendToSignIn()
				}
			>
				{jackpot.optIn ? "Opt out" : "Opt in"}
			</Button>
		</div>
	);
}
