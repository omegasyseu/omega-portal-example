import { Button, Group, Text, Title } from "@mantine/core";
import { IconTrophy } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useEngageDialogLink } from "@/components/engage-dialog/use-engage-dialog.ts";
import { useLiveJackpots } from "@/components/jackpot/hooks/use-live-jackpots.ts";
import { JackpotTiers } from "@/components/jackpot/jackpot-tiers.tsx";
import classes from "./home.module.css";

const JACKPOT_ICON_SIZE = 28;

// The jackpot tier widget: the live value of each tier, for everyone. A brand running
// several jackpots shows the first one the feed sends.
export function HomeJackpot() {
	const {
		jackpots: [jackpot],
		isWaiting,
	} = useLiveJackpots();
	// Learn More opens the Jackpot dialog over the home page.
	const jackpotLink = useEngageDialogLink("jackpot");

	return (
		<section className={classes.jackpot} aria-labelledby="home-jackpot">
			<Group justify="space-between" wrap="nowrap" gap="sm">
				<Group wrap="nowrap" gap="sm">
					<span className={classes.jackpotIcon}>
						<IconTrophy size={JACKPOT_ICON_SIZE} aria-hidden />
					</span>
					<div>
						<Title order={2} id="home-jackpot" className={classes.jackpotName}>
							{jackpot?.name ?? "Jackpot"}
						</Title>
						<Text className={classes.sectionLead}>Could you win it?</Text>
					</div>
				</Group>
				<Button
					renderRoot={(props) => <Link {...props} {...jackpotLink} />}
					visibleFrom="sm"
				>
					Learn More
				</Button>
			</Group>
			{jackpot || isWaiting ? (
				<JackpotTiers
					tiers={jackpot?.tiers}
					currency={jackpot?.baseCurrency ?? ""}
					className={classes.tiers}
				/>
			) : (
				<Text className={classes.sectionLead}>
					No jackpot is running right now.
				</Text>
			)}
			<Button
				renderRoot={(props) => <Link {...props} {...jackpotLink} />}
				hiddenFrom="sm"
				fullWidth
			>
				Learn More
			</Button>
		</section>
	);
}
