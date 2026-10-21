import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";
import { showIpsErrorToast } from "@/server/IPS/ips-error-toast.tsx";

export type withDrawPropsAction = {
	amount: string;
	conversionId?: string;
	paymentInformationId?: number;
	paymentMethod: string;
};

export const useWithdraw = () => {
	const { selectedAccount } = useGeneralInfo();
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["withdraw"],
		mutationFn: async ({
			paymentMethod,
			amount,
			conversionId,
			paymentInformationId,
		}: withDrawPropsAction) => {
			const API = "/processWithdrawal";
			try {
				const res = await IPS_AXIOS_CLIENT.post(API, {
					sessionKey: selectedAccount?.sessionKey,
					paymentMethod,
					amount,
					...(conversionId && { conversionId }),
					...(paymentInformationId && { paymentInformationId }),
				});
				return res.data;
			} catch (e) {
				console.error("Error processing withdrawal:", e);
				throw e;
			}
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["IPS_USER_BALANCES"],
			});
			notifications.show({
				message: " Withdraw Successful",
				color: "neon",
				icon: <IconCheck />,
			});
		},
		onError: showIpsErrorToast,
	});
};
