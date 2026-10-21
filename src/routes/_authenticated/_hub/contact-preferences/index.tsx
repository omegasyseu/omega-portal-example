import { createFileRoute } from "@tanstack/react-router";
import { GeneralInfo } from "@/components/profile/general-info/general-info.tsx";

// Saved links to the old Contact Preferences page, an empty placeholder, open General info.
export const Route = createFileRoute(
	"/_authenticated/_hub/contact-preferences/",
)({
	component: GeneralInfo,
});
