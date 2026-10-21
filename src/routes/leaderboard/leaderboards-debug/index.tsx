import { Text } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import LeaderboardForm from "@/components/leaderboards/leaderboard/form.tsx";

const LeaderboardDebugPage = () => {
	return (
		<>
			<Text
				ta={"center"}
				tt={"uppercase"}
				fw={"bold"}
				fz={{
					base: "sm",
					lg: 40,
				}}
				c={"dark.0"}
				my={"xl"}
			>
				LEADERBOARDS
			</Text>
			<LeaderboardForm />
		</>
	);
};

export const Route = createFileRoute("/leaderboard/leaderboards-debug/")({
	component: LeaderboardDebugPage,
});
