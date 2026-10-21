import { queryOptions, useQuery } from "@tanstack/react-query";
import qs from "qs";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import type { PaymentInformationResponse } from "@/schemas-types/payments";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

type Props = {
	sessionKey?: string;
	type?: string;
	paymentMethods?: string[];
};

export const getPaymentInformation = async ({
	sessionKey,
	type,
	paymentMethods,
}: Props) => {
	const API = "/getPaymentInformation";

	try {
		const res = await IPS_AXIOS_CLIENT.get<PaymentInformationResponse>(API, {
			params: {
				sessionKey,
				type,
				paymentMethods,
			},
			paramsSerializer: (params) => {
				return qs.stringify(params, { arrayFormat: "repeat" });
			},
		});
		return res.data;
	} catch (e) {
		console.error("Error fetching payment methods:", e);
		throw e;
	}
};

export const getPaymentInformationOptions = ({
	sessionKey,
	type,
	paymentMethods,
}: Props) => {
	return queryOptions({
		queryKey: ["getPaymentInformation", { sessionKey, type, paymentMethods }],
		queryFn: () =>
			getPaymentInformation({
				sessionKey,
				type,
				paymentMethods,
			}),
		enabled: !!sessionKey,
	});
};

export const useGetPaymentInformation = (
	type: string,
	paymentMethods: string[],
) => {
	const { selectedAccount } = useGeneralInfo();
	return useQuery({
		...getPaymentInformationOptions({
			sessionKey: selectedAccount?.sessionKey,
			type,
			paymentMethods,
		}),
	});
};
