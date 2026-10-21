import { useQuery } from "@tanstack/react-query";
import type { z } from "zod";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import { BASE_RESPONSE_SCHEMA } from "@/schemas-types";
import { getBonusesPlansSchema } from "@/schemas-types/payments";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

type Props = {
	sessionKey?: string;
	paymentMethod?: string;
	depositAmount?: string;
};

const ResponseSchema = BASE_RESPONSE_SCHEMA.merge(
	getBonusesPlansSchema,
).optional();
type ResponseType = z.infer<typeof ResponseSchema>;

export const getDepositEligibleBonusPlans = async ({
	depositAmount,
	paymentMethod,
	sessionKey,
}: Props) => {
	const API = "/getDepositEligibleBonusPlans";

	try {
		const res = await IPS_AXIOS_CLIENT.get<ResponseType>(API, {
			params: {
				sessionKey,
				depositAmount,
				paymentMethod,
			},
		});
		return res.data;
	} catch (e) {
		console.error("Error fetching deposit eligible bonus plans:", e);
		throw e;
	}
};

// Asks as soon as there's an amount to check; with none, nothing is asked.
export const useGetDepositEligibleBonusPlan = ({
	depositAmount,
	paymentMethod,
}: Omit<Props, "sessionKey">) => {
	const { selectedAccount } = useGeneralInfo();
	return useQuery({
		queryKey: [
			"get-deposit-bonus-plans",
			{ sessionKey: selectedAccount?.sessionKey, depositAmount, paymentMethod },
		],
		queryFn: async () =>
			await getDepositEligibleBonusPlans({
				sessionKey: selectedAccount?.sessionKey,
				depositAmount,
				paymentMethod,
			}),
		enabled: Boolean(depositAmount && selectedAccount?.sessionKey),
		staleTime: 0,
		gcTime: 0,
	});
};
