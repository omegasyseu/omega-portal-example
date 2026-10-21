import {
	ActionIcon,
	CopyButton,
	TextInput,
	Title,
	Tooltip,
} from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import engage from "@/components/engage/engage.module.css";
import { useGetReferralLinksSuspense } from "@/server/IPS/profile-info/get-referral-links.ts";

const COPIED_FEEDBACK_MS = 2000;

const ReferralCodeSection = () => {
	const { data } = useGetReferralLinksSuspense();
	const referralCode = data?.referralLinks?.[0]?.referralCode;

	const createSignupUrl = (code: string) => {
		const baseUrl = window.location.origin;
		return `${baseUrl}/quick-signup?referralCode=${encodeURIComponent(code)}`;
	};

	return (
		<section className={engage.panel} aria-labelledby="referral-code-title">
			<Title order={2} id="referral-code-title" className={engage.panelTitle}>
				Your referral code
			</Title>
			<TextInput
				value={referralCode ?? ""}
				aria-labelledby="referral-code-title"
				readOnly
				rightSection={
					referralCode && (
						// Copies the sign-up link, not the bare code, so friends land on sign-up.
						<CopyButton
							value={createSignupUrl(referralCode)}
							timeout={COPIED_FEEDBACK_MS}
						>
							{({ copied, copy }) => (
								<Tooltip label={copied ? "Copied" : "Copy sign-up link"}>
									<ActionIcon
										variant="subtle"
										color="neon"
										c={copied ? undefined : "dark.1"}
										onClick={copy}
										aria-label={copied ? "Copied" : "Copy sign-up link"}
									>
										{copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
									</ActionIcon>
								</Tooltip>
							)}
						</CopyButton>
					)
				}
			/>
		</section>
	);
};

export default ReferralCodeSection;
