import { createFileRoute } from "@tanstack/react-router";
import { GeneralInfo } from "@/components/profile/general-info/general-info.tsx";

export const Route = createFileRoute("/_authenticated/_hub/profile/")({
	component: GeneralInfo,
});
