import { queryOptions, useQuery } from "@tanstack/react-query";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import type { RecommendedPaymentMethodResponse } from "@/schemas-types/payments";
import { IPS_AXIOS_CLIENT } from "../IPS_CONFIG";

type RecommendedPaymentMethodRequest = {
	sessionKey?: string;
	type?: string;
	shouldFetchRecommended: boolean;
};

const getRecommendedPaymentMethod = async ({
	sessionKey,
	type,
}: RecommendedPaymentMethodRequest) => {
	const API = "/getRecommendedPaymentMethod";
	const res = await IPS_AXIOS_CLIENT.get<RecommendedPaymentMethodResponse>(
		API,
		{
			params: {
				sessionKey,
				type,
			},
		},
	);
	const responseData = res.data;
	return responseData;
};

export const getRecommendedPaymentMethodOptions = ({
	sessionKey,
	type,
	shouldFetchRecommended,
}: RecommendedPaymentMethodRequest) => {
	return queryOptions({
		queryKey: ["getRecommendedPaymentMethod", { sessionKey, type }],
		queryFn: () =>
			getRecommendedPaymentMethod({ sessionKey, type, shouldFetchRecommended }),
		enabled: !!sessionKey && !!shouldFetchRecommended,
	});
};

export const useGetRecommendedPaymentMethod = (
	type: string,
	shouldFetchRecommended: boolean,
) => {
	const { selectedAccount } = useGeneralInfo();
	return useQuery({
		...getRecommendedPaymentMethodOptions({
			sessionKey: selectedAccount?.sessionKey,
			type,
			shouldFetchRecommended,
		}),
	});
};
