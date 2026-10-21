import { Button, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { useShellNavigation } from "@/layout/shell/use-shell-navigation.ts";
import classes from "./home.module.css";

// The home page's opening banner, in our own art. Its button is the shell's call to
// action: Register when logged out, Deposit (Buy Coins on social brands) when logged in.
export function HomeHero() {
	const { callToAction } = useShellNavigation();

	return (
		<section className={classes.hero} aria-labelledby="home-hero-title">
			<div className={classes.heroText}>
				<Title order={1} id="home-hero-title" className={classes.heroTitle}>
					Your next big win starts here
				</Title>
				<Text className={classes.heroLead}>
					Slots, sports and live jackpots in one place.
				</Text>
				<Button component={Link} to={callToAction.to} size="lg">
					{callToAction.label}
				</Button>
			</div>
		</section>
	);
}
