import { queryOptions } from "@tanstack/react-query";
import type { CurrencySelection } from "@/schemas-types";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

type Props = {
	productCode: string;
	sessionKey: string;
	brandId?: number;
};

const getGameCurrencyConversion = async ({
	productCode,
	sessionKey,
	brandId,
}: Props) => {
	const API = "/getGameCurrencyConversions";
	try {
		const res = await IPS_AXIOS_CLIENT.get<CurrencySelection>(API, {
			params: {
				sessionKey: sessionKey,
				productCode: productCode,
				brandId: brandId,
			},
		});
		return res.data;
	} catch (e) {
		console.error("Error fetching game currency conversions:", e);
		throw e;
	}
};

export const getGameCurrencyConversionOptions = ({
	sessionKey,
	productCode,
	brandId,
}: Props) => {
	return queryOptions({
		queryKey: [
			"getGameCurrencyConversionOptions",
			{ sessionKey, productCode, brandId },
		],
		queryFn: () =>
			getGameCurrencyConversion({ sessionKey, productCode, brandId }),

		gcTime: 1000 * 60 * 60 * 24,
		refetchOnWindowFocus: false,
	});
};
