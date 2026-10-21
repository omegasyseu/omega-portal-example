import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";
import { ipsErrorMessage } from "@/server/IPS/ips-error-toast.tsx";

// Shows the backend's own explanation (e.g. "Deposit limit cannot be greater than Balance limit") when it sent one.
// Field codes such as INVALID_VALUE aren't player-readable, so formatErrors() isn't used here.
export const showErrorToast = (error: unknown, fallback: string) => {
	notifications.show({
		message:
			error instanceof IPSErrors
				? ipsErrorMessage(error, error.backendMessage ?? fallback)
				: fallback,
		color: "danger",
		icon: <IconX />,
	});
};
