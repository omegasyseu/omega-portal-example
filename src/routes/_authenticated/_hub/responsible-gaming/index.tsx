import { createFileRoute } from "@tanstack/react-router";
import { RgLimits } from "@/components/responsible-gaming/rg-limits.tsx";

export const Route = createFileRoute(
	"/_authenticated/_hub/responsible-gaming/",
)({
	component: RgLimits,
});
