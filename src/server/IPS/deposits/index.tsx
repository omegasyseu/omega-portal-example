import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";
import { showIpsErrorToast } from "@/server/IPS/ips-error-toast.tsx";

// IPS's answer when the deposit continues on the payment provider's own site.
export const CONTINUE_TO_PAYMENT_SITE = "CONTINUE_TO_PAYMENT_SITE";

type PaymentMethodSubmission = {
	amount?: string;
	paymentMethod: string;
	evoucher?: string;
	requestedBonusPlanId?: string;
	conversionId?: string;
	sessionKey?: string;
	noSuccessNotification?: boolean;
};

export const handleDepositMethod = async ({
	paymentMethod,
	amount,
	conversionId,
	sessionKey,
	evoucher,
	requestedBonusPlanId,
}: PaymentMethodSubmission) => {
	const API = "/processDeposit";

	try {
		const res = await IPS_AXIOS_CLIENT.post(API, {
			sessionKey,
			paymentMethod,
			...(amount && { amount }),
			...(evoucher && { evoucher }),
			...(requestedBonusPlanId && { requestedBonusPlanId }),
			...(conversionId && { conversionId }),
		});
		return res.data;
	} catch (e) {
		console.error("Error processing deposit:", e);
		throw e;
	}
};

export const useQuickDeposit = () => {
	const queryClient = useQueryClient();
	const { selectedAccount } = useGeneralInfo();
	return useMutation({
		mutationKey: ["QuickDeposit"],
		mutationFn: async ({
			paymentMethod,
			amount,
			evoucher,
		}: Omit<
			PaymentMethodSubmission,
			"sessionKey" | "requestedBonusPlanId" | "conversionId"
		>) =>
			handleDepositMethod({
				sessionKey: selectedAccount?.sessionKey,
				paymentMethod,
				amount,
				evoucher,
			}),
		onSuccess: async (variables) => {
			await queryClient.invalidateQueries({
				queryKey: ["IPS_USER_BALANCES"],
			});

			if (!variables.noSuccessNotification) {
				notifications.show({
					message: "Deposit Successful",
					color: "neon",
					icon: <IconCheck />,
				});
			}
		},
		onError: (error) => {
			console.log({ error });
			showIpsErrorToast(error);
		},
	});
};

export const useDeposit = () => {
	const queryClient = useQueryClient();
	const { selectedAccount } = useGeneralInfo();
	return useMutation({
		mutationKey: ["Deposit"],
		mutationFn: async ({
			paymentMethod,
			amount,
			evoucher,
			requestedBonusPlanId,
			conversionId,
		}: Omit<PaymentMethodSubmission, "sessionKey">) =>
			handleDepositMethod({
				sessionKey: selectedAccount?.sessionKey,
				paymentMethod,
				...(amount && { amount }),
				...(evoucher && { evoucher }),
				...(requestedBonusPlanId && { requestedBonusPlanId }),
				...(conversionId && { conversionId }),
			}),
		onSuccess: async (data, variables) => {
			await queryClient.invalidateQueries({
				queryKey: ["IPS_USER_BALANCES"],
			});
			if (data.status === CONTINUE_TO_PAYMENT_SITE) {
				notifications.show({
					message: " Redirecting...",
					color: "neon",
					icon: <IconCheck />,
				});
			} else if (!variables.noSuccessNotification) {
				notifications.show({
					message: " Deposit Successful",
					color: "neon",
					icon: <IconCheck />,
				});
			}
		},
		onError: showIpsErrorToast,
	});
};
