import { createFileRoute } from "@tanstack/react-router";
import LevelupView from "@/components/levelup";

const LevelupPage = () => {
	return <LevelupView />;
};

export const Route = createFileRoute("/_levelup/levelup/")({
	component: LevelupPage,
});
