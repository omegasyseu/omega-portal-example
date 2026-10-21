import { Anchor } from "@mantine/core";
import { LegalLinksInNewTab } from "@/components/legal/legal-blocks.tsx";
import {
	LegalPageBody,
	legalPageTitle,
} from "@/components/legal/legal-page.tsx";
import {
	type LegalPageSlug,
	legalPageFor,
} from "@/components/legal/legal-page-model.ts";
import { PortalModal } from "@/components/route-modal";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";

// One of the Selected Brand's Legal Pages in a dialog over the page, so whatever is under
// it (a sign-up form) keeps what was typed: its links open a new tab. Rendered in place,
// not through the modals manager, so the page's body stays inside the router.
export const LegalPageModal = ({
	slug,
	onClose,
}: {
	slug: LegalPageSlug | undefined;
	onClose: () => void;
}) => {
	const content = useBrandContent();
	const shown = slug ? legalPageFor(content, slug) : undefined;

	return (
		<PortalModal
			opened={shown !== undefined}
			onClose={onClose}
			size="lg"
			title={shown ? legalPageTitle(shown) : undefined}
		>
			{shown ? (
				<>
					<LegalLinksInNewTab value>
						<LegalPageBody result={shown} />
					</LegalLinksInNewTab>
					<Anchor href={`/legal/${slug}`} target="_blank" rel="noopener">
						Open in a new tab
					</Anchor>
				</>
			) : null}
		</PortalModal>
	);
};
