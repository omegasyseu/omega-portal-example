import { useQuery } from "@tanstack/react-query";
import type { z } from "zod";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import { BASE_RESPONSE_SCHEMA } from "@/schemas-types";
import { getDepositsLimitsSchema } from "@/schemas-types/payments";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

type Props = {
	sessionKey: string;
	paymentMethodCode: string;
};

const ResponseSchema = BASE_RESPONSE_SCHEMA.merge(
	getDepositsLimitsSchema,
).optional();
type ResponseType = z.infer<typeof ResponseSchema>;

export const getDepositLimits = async ({
	paymentMethodCode,
	sessionKey,
}: Props) => {
	const API = "/getDepositLimits";

	try {
		const res = await IPS_AXIOS_CLIENT.get<ResponseType>(API, {
			params: {
				sessionKey,
				paymentMethodCode,
			},
		});
		return res.data;
	} catch (e) {
		console.error("Error fetching deposit limits:", e);
		throw e;
	}
};

export const useGetDepositLimitsByCurrency = ({
	paymentMethodCode,
}: Omit<Props, "sessionKey">) => {
	const { selectedAccount } = useGeneralInfo();
	return useQuery({
		queryKey: [
			"get-deposit-limits",
			{ sessionKey: selectedAccount?.sessionKey },
		],
		queryFn: async () =>
			await getDepositLimits({
				sessionKey: `${selectedAccount?.sessionKey}`,
				paymentMethodCode,
			}),
		enabled: !!selectedAccount?.sessionKey && !!paymentMethodCode,
	});
};
