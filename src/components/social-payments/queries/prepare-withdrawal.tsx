import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";
import { ipsErrorMessage } from "@/server/IPS/ips-error-toast.tsx";

type RedeemProps = {
	sessionKey?: string;
	paymentMethod?: string;
};
type RedeemTypeRes = {
	status: string;
	sessionId: string | unknown;
	conversionId: string;
	convertToCurrency: string;
	convertFromCurrency: string;
	conversionRate: string;
};

const prepareWithdrawalOptions = ({
	paymentMethod,
	sessionKey,
}: RedeemProps) => {
	return queryOptions({
		queryKey: ["prepareWithdrawal-redeem", { paymentMethod }],
		queryFn: async () => {
			const API = "/prepareWithdrawal";
			const res = await IPS_AXIOS_CLIENT.get<RedeemTypeRes>(API, {
				params: {
					action: "GET_EXCHANGE_INFO",
					paymentMethod,
					sessionKey,
				},
			});
			return res.data;
		},
		enabled: !!sessionKey && !!paymentMethod,
	});
};

export const useGetPrepareWithdrawal = ({
	paymentMethod,
}: Omit<RedeemProps, "sessionKey">) => {
	const { selectedAccount } = useGeneralInfo();
	return useQuery({
		...prepareWithdrawalOptions({
			sessionKey: selectedAccount?.sessionKey,
			paymentMethod,
		}),
	});
};

type RedeemTypePost = {
	paymentMethod: string;
	amount: string;
	conversionId?: string;
};

export const useRedeemWithdrawal = () => {
	const { selectedAccount } = useGeneralInfo();
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["process-withdrawal"],
		mutationFn: async ({
			amount,
			conversionId,
			paymentMethod,
		}: RedeemTypePost) => {
			const API = "/processWithdrawal";
			const res = await IPS_AXIOS_CLIENT.post(API, {
				sessionKey: selectedAccount?.sessionKey,
				paymentMethod,
				amount,
				conversionId,
			});
			return res.data;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["IPS_USER_BALANCES"],
			});
			notifications.show({
				message: "Redeem Successful",
				color: "neon",
				icon: <IconCheck />,
			});
		},
		onError: (error) => {
			if (error instanceof IPSErrors) {
				notifications.show({
					message: ipsErrorMessage(
						error,
						error.message || error.formatErrors(),
					),
				});
				console.log({
					error: error.formatErrors(),
				});
			} else {
				notifications.show({
					message: "An unexpected error occurred",
				});
				console.log({
					error: error.message,
				});
			}
		},
	});
};
