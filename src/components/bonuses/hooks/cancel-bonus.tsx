import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ACTIVE_BONUS_KEY } from "@/components/bonuses/queries/get-active-bonuses.ts";
import { BONUS_HISTORY_KEY } from "@/components/bonuses/queries/get-bonuses-history.ts";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";
import { ipsErrorMessage } from "@/server/IPS/ips-error-toast.tsx";

type Params = {
	bonusId: string;
};
export const useCancelBonus = () => {
	const { session } = useSession();
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["cancel-bonus"],
		mutationFn: async ({ bonusId }: Params) => {
			const API = "/cancelBonus";
			try {
				const res = await IPS_AXIOS_CLIENT.post(API, {
					sessionKey: session?.user?.sessionKey,
					bonusId,
				});
				return res.data;
			} catch (e) {
				console.error("Error canceling bonuse:", e);
				throw e;
			}
		},
		onSuccess: async (_) => {
			await queryClient.invalidateQueries({
				queryKey: [ACTIVE_BONUS_KEY],
			});
			await queryClient.invalidateQueries({
				queryKey: [BONUS_HISTORY_KEY],
			});
			notifications.show({
				id: "active-bonus",
				message: "You canceled bonus",
				color: "neon",
				icon: <IconCheck />,
				withCloseButton: true,
				loading: false,
			});
		},
		onError: (error) => {
			if (error instanceof IPSErrors) {
				notifications.show({
					id: "active-bonus",
					message: ipsErrorMessage(
						error,
						error.formatErrors() || error.message,
					),
					color: "danger",
					icon: <IconX />,
					loading: false,
					withCloseButton: true,
				});
			} else {
				notifications.show({
					id: "active-bonus",
					message: "An unexpected error occurred",
				});
			}
		},
	});
};
