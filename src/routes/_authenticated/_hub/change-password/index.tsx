import { createFileRoute } from "@tanstack/react-router";
import { GeneralInfo } from "@/components/profile/general-info/general-info.tsx";

// Saved links to the old Change Password page open General info, which holds it now.
export const Route = createFileRoute("/_authenticated/_hub/change-password/")({
	component: GeneralInfo,
});
