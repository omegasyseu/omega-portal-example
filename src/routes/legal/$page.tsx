import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page.tsx";

// Public: outside _authenticated, so anyone can read the Brand's Legal Pages.
const LegalPageRoute = () => <LegalPage slug={Route.useParams().page} />;

export const Route = createFileRoute("/legal/$page")({
	component: LegalPageRoute,
});
