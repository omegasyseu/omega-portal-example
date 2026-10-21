import { queryOptions, useQuery } from "@tanstack/react-query";
import { SUPPORTED_WITHDRAWAL_METHODS } from "@/constants/payments";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import type { MixedWithdrawalMethods } from "@/schemas-types/payments";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

type Methods = {
	sessionKey?: string;
};

export const getWithdrawalMethods = async ({ sessionKey }: Methods) => {
	const API = "/getWithdrawalMethods";

	try {
		const res = await IPS_AXIOS_CLIENT.get<MixedWithdrawalMethods>(API, {
			params: {
				sessionKey,
			},
		});
		const response = res.data;
		const supportedMethods = response?.withdrawalMethods?.filter((method) =>
			SUPPORTED_WITHDRAWAL_METHODS.some((item) => item.code === method.code),
		);
		const withdrawalMethods = response?.withdrawalMethods?.map((method) => {
			return {
				label: method.paymentMethod,
				value: method.code,
			};
		});

		// Every method IPS offers the player, by code, whether or not the portal lists it.
		const offeredCodes =
			response?.withdrawalMethods?.map((method) => method.code) ?? [];
		return {
			response,
			supportedMethods,
			withdrawalMethods,
			offeredCodes,
		};
	} catch (e) {
		console.error("Error fetching withdrawal methods:", e);
		throw e;
	}
};

export const getWithdrawalOptions = ({ sessionKey }: Methods) => {
	return queryOptions({
		queryKey: ["getWithdrawalMethods", { sessionKey }],
		queryFn: () =>
			getWithdrawalMethods({
				sessionKey,
			}),
		enabled: !!sessionKey,
	});
};
export const useGetWithdrawalOptions = () => {
	const { selectedAccount } = useGeneralInfo();
	return useQuery({
		...getWithdrawalOptions({
			sessionKey: selectedAccount?.sessionKey,
		}),
	});
};
