import { Button, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link } from "@tanstack/react-router";
import { PortalModal } from "@/components/route-modal";
import { usePromptOnce } from "@/hooks/use-prompt-once.ts";
import { useNeedsKycAction } from "./use-needs-kyc-action.ts";

const DIALOG_WIDTH = 440;

// "Verify your identity" while the player's brand is asking for KYC (useNeedsKycAction),
// shown once per sign-in. It only informs; Not now closes it.
export function KycPromptModal() {
	const [isOpen, { open, close }] = useDisclosure(false);
	const shouldPrompt = useNeedsKycAction();
	usePromptOnce("kyc", shouldPrompt, open);

	return (
		<PortalModal
			opened={isOpen && shouldPrompt}
			onClose={close}
			size={DIALOG_WIDTH}
			title="Verify your identity"
		>
			<Text c="dark.1" fz="sm" mb="md">
				We need to verify your identity. You can start from the KYC card on your
				profile.
			</Text>
			<Stack gap="sm">
				<Button
					component={Link}
					to="/profile"
					size="md"
					fullWidth
					onClick={close}
				>
					Go to my profile
				</Button>
				<Button variant="subtle" color="dark.1" onClick={close}>
					Not now
				</Button>
			</Stack>
		</PortalModal>
	);
}
