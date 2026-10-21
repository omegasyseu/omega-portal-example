import { createFileRoute } from "@tanstack/react-router";
import { HubSection } from "@/components/profile/hub/hub-section.tsx";
import UploadDocumentsView from "@/components/upload-documents";

const UploadDocumentsPage = () => (
	<HubSection title="Your documents">
		<UploadDocumentsView />
	</HubSection>
);

export const Route = createFileRoute("/_authenticated/_hub/upload-documents/")({
	component: UploadDocumentsPage,
});
