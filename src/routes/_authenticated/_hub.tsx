import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProfileHub } from "@/components/profile/hub/profile-hub.tsx";

// The profile hub's header and tabs around each of its tabs' pages. Pathless, so the
// account URLs players have saved still work.
const ProfileHubLayout = () => (
	<ProfileHub>
		<Outlet />
	</ProfileHub>
);

export const Route = createFileRoute("/_authenticated/_hub")({
	component: ProfileHubLayout,
});
