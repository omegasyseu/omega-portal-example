import { Anchor } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { router } from "@/main.tsx";
import { IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";
import { KYC_REFUSAL_LEAD } from "@/server/IPS/kyc-refusal.ts";

const UNEXPECTED_ERROR = "An unexpected error occurred";

// Toasts render outside RouterProvider, so the link navigates through the router instance.
const KycRefusalNotice = () => (
	<>
		{KYC_REFUSAL_LEAD}{" "}
		<Anchor
			component="button"
			inherit
			onClick={() => router.navigate({ to: "/profile" })}
		>
			Go to my profile
		</Anchor>
	</>
);

// The message for a failed IPS request: a KYC refusal links to the profile, anything else
// shows the caller's text.
export const ipsErrorMessage = (error: IPSErrors, text: string): ReactNode =>
	error.isKycRefusal ? <KycRefusalNotice /> : text;

// The error toast for a failed IPS request a signed-in player made: IPS's own field
// errors or message, or the KYC refusal with its link.
export const showIpsErrorToast = (error: unknown) => {
	notifications.show({
		message:
			error instanceof IPSErrors
				? ipsErrorMessage(error, error.formatErrors() || error.message)
				: UNEXPECTED_ERROR,
		color: "danger",
		icon: <IconX />,
	});
};
