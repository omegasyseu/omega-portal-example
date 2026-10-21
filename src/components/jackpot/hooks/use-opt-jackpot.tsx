import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";
import { ipsErrorMessage } from "@/server/IPS/ips-error-toast.tsx";

type Params = {
	checked: boolean;
	jackpotId: string;
};

export const useOptJackpot = () => {
	const { session } = useSession();
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["opt-jackpot"],
		mutationFn: async ({ checked, jackpotId }: Params) => {
			console.log({
				checked,
			});
			const API = checked ? "/optInJackpots" : "/optOutJackpots";

			try {
				const res = await IPS_AXIOS_CLIENT.post(API, {
					sessionKey: session?.user?.sessionKey,
					jackpotId,
				});
				return res.data;
			} catch (e) {
				console.error("Error opting-in jackpots:", e);
				throw e;
			}
		},

		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: ["fetch-eligible-jackpots"],
			});
			notifications.show({
				id: "jackpot",
				message: variables.checked
					? "Opted In Successful"
					: " Opted Out Successful",
				color: "neon",
				icon: <IconCheck />,
				withCloseButton: true,
				loading: false,
			});
		},
		onError: (error) => {
			if (error instanceof IPSErrors) {
				notifications.show({
					id: "jackpot",
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
					id: "jackpot",
					message: "An unexpected error occurred",
				});
			}
		},
	});
};
