import { Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import engage from "@/components/engage/engage.module.css";
import LeaderboardTable from "@/components/leaderboards/leaderboard/leaderboard-table.tsx";
import { leaderboardSearchSchema } from "@/schemas-types/leaderboard";

const Leaderboard = () => {
	return (
		<div className={engage.page}>
			<div>
				<Title order={1} className={engage.title}>
					Leaderboard
				</Title>
				<Text className={engage.lead}>
					The players who wagered most in the period, and what they win.
				</Text>
			</div>
			<LeaderboardTable />
		</div>
	);
};

export const Route = createFileRoute("/leaderboard/")({
	component: Leaderboard,
	validateSearch: leaderboardSearchSchema,
});
