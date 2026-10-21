import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";
import { ipsErrorMessage } from "@/server/IPS/ips-error-toast.tsx";

export const useRedeemCashback = () => {
	const { session } = useSession();
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["redeemCashback"],
		// biome-ignore lint/suspicious/noConfusingVoidType: void lets callers run mutate() with no variables (TanStack Query)
		mutationFn: async (params: { cashbackPlanId?: number } | void) => {
			const API = "/redeemCashback";
			const cashbackPlanId =
				params && "cashbackPlanId" in params
					? params.cashbackPlanId
					: undefined;
			try {
				const res = await IPS_AXIOS_CLIENT.post(API, {
					sessionKey: session?.user?.sessionKey,
					...(cashbackPlanId != null && { cashbackPlanId }),
				});
				return res.data;
			} catch (e) {
				console.error("Error redeeming cashback:", e);
				throw e;
			}
		},
		onMutate: () => {
			notifications.show({
				id: "cashback",
				color: "brand",
				loading: true,
				title: "Redeeming Cashback",
				message: "",
				autoClose: false,
				withCloseButton: false,
			});
		},

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["IPS_USER_BALANCES", { user: session?.user?.sessionKey }],
			});
			await queryClient.invalidateQueries({
				queryKey: ["IPS_CASHBACK", { user: session?.user?.sessionKey }],
			});
			notifications.update({
				id: "cashback",
				message: " Cashback Successful",
				color: "neon",
				icon: <IconCheck />,
				withCloseButton: true,
				loading: false,
			});
		},
		onError: (error) => {
			if (error instanceof IPSErrors) {
				notifications.update({
					id: "cashback",
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
				notifications.update({
					id: "cashback",
					message: "An unexpected error occurred",
					color: "danger",
					icon: <IconX />,
					loading: false,
					withCloseButton: true,
				});
			}
		},
	});
};
