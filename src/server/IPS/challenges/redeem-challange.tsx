import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "@/providers/authentication/authentication.tsx";
// import type { challengerResponse } from "@/schemas-types";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";
import { ipsErrorMessage } from "@/server/IPS/ips-error-toast.tsx";
// import type { z } from "zod";

// type ResponseType = z.infer<typeof challengerResponse>;

export const useRedeemChallenge = () => {
	const { session } = useSession();
	return useMutation({
		mutationKey: ["RedeemChallenge"],
		mutationFn: async ({ challengeUUID }: { challengeUUID: string }) => {
			const API = "/challenge/redeem";
			try {
				const res = await IPS_AXIOS_CLIENT.post(API, {
					sessionKey: session?.user?.sessionKey,
					challengeUUID,
				});
				return res.data;
			} catch (e) {
				console.error("Error redeeming challenges:", e);
				throw e;
			}
		},
		onMutate: (variables) => {
			notifications.show({
				id: `${variables?.challengeUUID}Redeem`,
				color: "brand",
				loading: true,
				title: "Redeeming Challenge",
				message: "",
				autoClose: false,
				withCloseButton: false,
			});
		},
		onSuccess: (_, variables) => {
			notifications.update({
				loading: false,

				id: `${variables?.challengeUUID}Redeem`,
				color: "neon",
				title: "Challenge Redeemed",
				message: "",
				autoClose: 5000,
				withCloseButton: true,
			});
		},
		onError: (error, variables) => {
			console.log({ error });
			if (error instanceof IPSErrors) {
				notifications.update({
					message: ipsErrorMessage(
						error,
						error.formatErrors() || error.message,
					),
					loading: false,
					id: `${variables?.challengeUUID}Redeem`,
					color: "danger",
					title: "Redeem Failed",
					autoClose: 2000,
					withCloseButton: true,
				});
				console.log({
					error: error.formatErrors(),
				});
			} else {
				notifications.show({
					message: "An unexpected error occurred",
				});
			}
		},
	});
};
