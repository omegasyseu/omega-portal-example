import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";
import { ipsErrorMessage } from "@/server/IPS/ips-error-toast.tsx";

type Params = {
	levelUpUUID: string;
	level: string;
};
export const useRedeemLevelUp = () => {
	const { session } = useSession();
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["redeem-level-up"],
		mutationFn: async ({ levelUpUUID, level }: Params) => {
			const API = "/levelup/redeem";
			try {
				const res = await IPS_AXIOS_CLIENT.post(API, {
					sessionKey: session?.user?.sessionKey,
					levelUpUUID,
					level,
				});
				return res.data;
			} catch (e) {
				console.error("Error opting-in jackpots:", e);
				throw e;
			}
		},
		onSuccess: async (_) => {
			await queryClient.invalidateQueries({
				queryKey: ["fetch-levelup-info"],
			});
			notifications.show({
				id: "Levelup",
				message: "You Have redeemed Level up Succefully",
				color: "neon",
				icon: <IconCheck />,
				withCloseButton: true,
				loading: false,
			});
		},
		onError: (error) => {
			if (error instanceof IPSErrors) {
				notifications.show({
					id: "Levelup",
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
					id: "Levelup",
					message: "An unexpected error occurred",
				});
			}
		},
	});
};
