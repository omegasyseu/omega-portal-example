import { queryOptions, useQuery } from "@tanstack/react-query";
import { PAYMENT_METHOD_CODE } from "@/constants/payments";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import type { depositsWithBaseRes } from "@/schemas-types/payments";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

type DepositMethods = {
	sessionKey?: string;
};

const SUPPORTED_BANK_METHODS = new Set<string>([
	PAYMENT_METHOD_CODE.OMEGA_BANK,
]);

const SUPPORTED_CARD_METHODS = new Set<string>([
	PAYMENT_METHOD_CODE.PAYCOM,
	PAYMENT_METHOD_CODE.PAYMENTIQ_ALL,
]);

const SUPPORTED_OTHER_METHODS = new Set<string>([
	PAYMENT_METHOD_CODE.EVOUCHER,
	PAYMENT_METHOD_CODE.COINSPAID_V2,
]);

const getDepositMethods = async ({ sessionKey }: DepositMethods) => {
	const API = "/getDepositMethods";
	try {
		const res = await IPS_AXIOS_CLIENT.get<depositsWithBaseRes>(API, {
			params: {
				sessionKey,
			},
		});
		const responseData = res.data;
		const supportedOtherMethods = responseData?.depositMethods?.filter(
			(method) => SUPPORTED_OTHER_METHODS.has(method.code),
		);
		const supportedBankMethods = responseData?.depositMethods?.filter(
			(method) => SUPPORTED_BANK_METHODS.has(method.code),
		);
		const supportedCardMethods = responseData?.depositMethods?.filter(
			(method) => SUPPORTED_CARD_METHODS.has(method.code),
		);
		const paymentMethodsValueAndLabel = responseData?.depositMethods?.map(
			(method) => {
				return {
					label: method.paymentMethod,
					value: method.code,
				};
			},
		);
		// Every method IPS offers the player, by code, whether or not the portal lists it.
		const offeredCodes =
			responseData?.depositMethods?.map((method) => method.code) ?? [];
		return {
			responseData,
			supportedOtherMethods,
			supportedBankMethods,
			supportedCardMethods,
			paymentMethodsValueAndLabel,
			offeredCodes,
		};
	} catch (e) {
		console.error("Error fetching deposit methods:", e);
		throw e;
	}
};

const getMethodsOptions = ({ sessionKey }: DepositMethods) => {
	return queryOptions({
		queryKey: ["deposit-methods", { sessionKey }],
		queryFn: async () =>
			await getDepositMethods({
				sessionKey,
			}),
		enabled: !!sessionKey,
	});
};
export const useGetDepositMethods = () => {
	const { selectedAccount } = useGeneralInfo();
	return useQuery({
		...getMethodsOptions({
			sessionKey: selectedAccount?.sessionKey,
		}),
	});
};
