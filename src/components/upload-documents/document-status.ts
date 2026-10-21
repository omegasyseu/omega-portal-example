import type { MantineColor } from "@mantine/core";
import { NEUTRAL_LIGHT_BADGE_COLOR } from "@/constants/badge-colours.ts";
import { codeLabel } from "@/utils/code-label.ts";

// IPS document statuses (EnumDocumentStatus): VERIFYING while staff check it, then
// APPROVED or DECLINED; REVIEWED, NOT_REVIEWED, EXPIRED, DELETED and ON_HOLD read as
// neutral. Players aren't told why a document was declined, only to send it again.
const BADGES: Record<string, { color: MantineColor; label: string }> = {
	VERIFYING: { color: "gold", label: "Verifying" },
	APPROVED: { color: "neon", label: "Approved" },
	DECLINED: { color: "danger", label: "Declined, please upload again" },
};

export const documentStatusBadge = (status: string) =>
	BADGES[status.toUpperCase()] ?? {
		color: NEUTRAL_LIGHT_BADGE_COLOR,
		label: codeLabel(status),
	};
