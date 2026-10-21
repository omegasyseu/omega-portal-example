import { createFileRoute } from "@tanstack/react-router";
import GamingHistoryFormAndTable from "@/components/profile/gaming-history/gaming-history-form.tsx";
import { HubSection } from "@/components/profile/hub/hub-section.tsx";

const GamingHistory = () => (
	<HubSection title="Game history">
		<GamingHistoryFormAndTable />
	</HubSection>
);

export const Route = createFileRoute("/_authenticated/_hub/gaming-history/")({
	component: GamingHistory,
});
