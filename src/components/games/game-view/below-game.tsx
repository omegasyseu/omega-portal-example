import { Tabs } from "@mantine/core";
import { type ReactNode, useState } from "react";
import { ChallengesModalContent } from "@/components/challenges/challenges-modal-content.tsx";
import classes from "./below-game.module.css";
import { DailyRace, useDailyRace } from "./daily-race.tsx";

type Tab = { value: "challenges" | "race"; label: string; panel: ReactNode };

type Props = {
	// The Game widgets switches, saved as showChallenge and showLeaderboard.
	showChallenges: boolean;
	showRace: boolean;
};

// Below the game, as on Omega Wins: the Daily Challenges and the Daily Race, one tab
// each. The toolbar's Game widgets switches hide either; the race's tab also goes when
// no daily leaderboard is running.
export function BelowGame({ showChallenges, showRace }: Props) {
	const race = useDailyRace(showRace);
	const tabs: Tab[] = [
		...(showChallenges
			? [
					{
						value: "challenges" as const,
						label: "Daily Challenges",
						panel: <ChallengesModalContent hasIntro={false} />,
					},
				]
			: []),
		...(showRace && race.hasRace
			? [
					{
						value: "race" as const,
						label: race.name ?? "Daily Race",
						panel: <DailyRace />,
					},
				]
			: []),
	];
	const [chosen, setChosen] = useState<string | null>(null);
	// The chosen tab can go (switched off, or the race ended), so fall back to the first.
	const active = tabs.find(({ value }) => value === chosen) ?? tabs[0];

	if (active === undefined) {
		return null;
	}

	return (
		<Tabs value={active.value} onChange={setChosen} classNames={classes}>
			<Tabs.List>
				{tabs.map(({ value, label }) => (
					<Tabs.Tab key={value} value={value}>
						{label}
					</Tabs.Tab>
				))}
			</Tabs.List>
			{tabs.map(({ value, panel }) => (
				<Tabs.Panel key={value} value={value}>
					{panel}
				</Tabs.Panel>
			))}
		</Tabs>
	);
}
