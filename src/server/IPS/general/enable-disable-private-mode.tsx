import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrimaryAccount } from "@/hooks/use-primary-account";
import { PRIVATE_MODE_QUERY_KEY } from "@/server/IPS/general/get-private-mode-status.ts";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";
import { ipsErrorMessage } from "@/server/IPS/ips-error-toast.tsx";

type Props = {
	action: "optIn" | "optOut";
};

// Private Mode is read and saved through the primary account, like the RG limits, so the
// switch always shows the flag it changes. (Each currency account is its own player record
// with its own flag; IPS applying it to the whole player is a backend change.)
export const useChangePrivateModeStatus = () => {
	const { sessionKey } = usePrimaryAccount();
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["enable-disable-private-mode"],
		mutationFn: async ({ action }: Props) => {
			if (!sessionKey) {
				throw new Error("No session to change private mode with");
			}
			const API =
				action === "optIn" ? "/privateMode/optIn" : "/privateMode/optOut";
			try {
				const res = await IPS_AXIOS_CLIENT.post(API, { sessionKey });
				return res.data;
			} catch (e) {
				console.error("Error changing private mode:", e);
				throw e;
			}
		},
		onSettled: () =>
			queryClient.invalidateQueries({ queryKey: [PRIVATE_MODE_QUERY_KEY] }),
		onSuccess: () => {
			notifications.show({
				message: "Private mode changed successfully",
				color: "neon",
				icon: <IconCheck />,
			});
		},
		onError: (error) => {
			if (error instanceof IPSErrors) {
				notifications.show({
					message: ipsErrorMessage(
						error,
						error.formatErrors() || error.message,
					),
					color: "danger",
					icon: <IconX />,
				});
			} else {
				notifications.show({
					message: "An unexpected error occurred",
					color: "danger",
					icon: <IconX />,
				});
			}
		},
	});
};
