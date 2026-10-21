import { queryOptions, useQuery } from "@tanstack/react-query";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import type {
	GET_CURRENCY_LIST,
	GET_PROVIDER_CRYPTO_ADDRESS,
	TAKE_ADDRESS,
} from "@/schemas-types/payments";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

type PrepareDepositType = {
	paymentMethod: string;
	action?:
		| "GET_CURRENCY_LIST"
		| "GET_CURRENCY_PAIR"
		| "TAKE_ADDRESS"
		| "GET_PROVIDER_CRYPTO_ADDRESS"
		| "GET_EXCHANGE_INFO";
	sessionKey: string;
	currency?: string;
	convertTo?: string;
};

export async function prepareDeposit<T>(
	params: PrepareDepositType,
): Promise<T> {
	const { paymentMethod, convertTo, action, currency, sessionKey } = params;
	const API = "/prepareDeposit";
	try {
		const res = await IPS_AXIOS_CLIENT.get(API, {
			params: {
				paymentMethod,
				action,
				sessionKey,
				...(currency && { currency }),
				...(convertTo && { convertTo }),
			},
		});
		return res.data as T;
	} catch (e) {
		console.error("Error preparing deposits:", e);
		throw e;
	}
}

type currencyListParams = Pick<
	PrepareDepositType,
	"paymentMethod" | "sessionKey"
>;
export const GetCurrencyList = async (param: currencyListParams) => {
	const { paymentMethod, sessionKey } = param;
	const res = await prepareDeposit<GET_CURRENCY_LIST>({
		paymentMethod,
		sessionKey,
		action: "GET_CURRENCY_LIST",
	});
	const currencyLabelAndValueCrypto = res?.data
		?.filter((currency) => currency.type === "crypto")
		.map((currency) => {
			return {
				label: currency.currency,
				value: currency.currency,
			};
		});

	return {
		res,
		currencyLabelAndValueCrypto,
	};
};

export const useGetCurrencyList = ({
	paymentMethod,
}: {
	paymentMethod: string;
}) => {
	const { selectedAccount } = useGeneralInfo();
	return useQuery({
		queryKey: ["GET_CURRENCY_LIST"],
		queryFn: async () =>
			await GetCurrencyList({
				sessionKey: selectedAccount?.sessionKey as string,
				paymentMethod,
			}),
		enabled: !!selectedAccount?.sessionKey && !!paymentMethod,
	});
};

type GetBtcWallet = Pick<
	PrepareDepositType,
	"paymentMethod" | "sessionKey" | "convertTo" | "currency"
>;

export const getBtcWallet = async (param: GetBtcWallet) => {
	const { paymentMethod, sessionKey, convertTo, currency } = param;
	if (currency === "undefined") {
		console.log("Currency is required for getBtcWallet.");
		return null;
	}
	const res = await prepareDeposit<TAKE_ADDRESS>({
		paymentMethod,
		action: "TAKE_ADDRESS",
		sessionKey,
		currency,
		...(convertTo && { convertTo }),
	});
	return res;
};

export const useGetBtcWallet = ({
	currency,
	paymentMethod,
}: {
	paymentMethod: string;
	currency: string;
}) => {
	const { selectedAccount } = useGeneralInfo();

	return useQuery({
		queryKey: ["TAKE_ADDRESS", { currency, paymentMethod, selectedAccount }],
		queryFn: async () =>
			await getBtcWallet({
				paymentMethod,
				currency,
				...(selectedAccount?.currency !== currency && {
					convertTo: selectedAccount?.currency,
				}),
				sessionKey: selectedAccount?.sessionKey as string,
			}),
		enabled: false,
	});
};

export const getCreatedCryptoAccounts = async (params: GetBtcWallet) => {
	const { paymentMethod, sessionKey, currency } = params;

	const res = await prepareDeposit<GET_PROVIDER_CRYPTO_ADDRESS>({
		paymentMethod,
		action: "GET_PROVIDER_CRYPTO_ADDRESS",
		sessionKey,
		currency,
	});
	return res;
};

export function getCreatedCryptoAccOptions(params: GetBtcWallet) {
	return queryOptions({
		queryKey: ["getCreatedCryptoAccounts", { params }],
		queryFn: () => getCreatedCryptoAccounts(params),
		enabled: !!params.sessionKey && !!params.paymentMethod && !!params.currency,
		gcTime: 1000 * 60 * 60 * 24,
	});
}

export const useGetCreatedCryptoAccounts = ({
	currency,
	paymentMethod,
}: {
	paymentMethod: string;
	currency: string;
}) => {
	const { selectedAccount } = useGeneralInfo();
	return useQuery({
		queryKey: [
			"getCreatedCryptoAccounts",
			{ sessionKey: selectedAccount?.sessionKey, currency, paymentMethod },
		],
		queryFn: () =>
			getCreatedCryptoAccounts({
				sessionKey: selectedAccount?.sessionKey as string,
				paymentMethod,
				currency,
			}),
		enabled: !!selectedAccount?.sessionKey && !!paymentMethod && !!currency,
	});
};
