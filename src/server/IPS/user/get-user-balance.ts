import { queryOptions, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useSession } from "@/providers/authentication/authentication.tsx";
import type { userBalances } from "@/schemas-types/profile/user-balance.ts";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";
import type { GeneralRequestType } from "@/server/IPS/user/get-player-info.ts";

export const getUserBalance = async ({ session }: GeneralRequestType) => {
	const API = "/getBalance";

	try {
		const res = await IPS_AXIOS_CLIENT.get<userBalances>(API, {
			params: {
				sessionKey: session?.user?.sessionKey,
			},
		});
		return res.data;
	} catch (e) {
		console.error("Error fetching user balance:", e);
		throw e;
	}
};

export const getUserBalanceOptions = ({ session }: GeneralRequestType) => {
	return queryOptions({
		queryKey: ["IPS_USER_BALANCES", { user: session?.user?.sessionKey }],
		queryFn: async () =>
			await getUserBalance({
				session,
			}),
		enabled: !!session?.user && !!session?.user?.sessionKey,
		meta: {
			persist: true,
		},
	});
};

export const useGetUserBalance = () => {
	const { session } = useSession();
	return useQuery({
		...getUserBalanceOptions({
			session,
		}),
	});
};
export const useGetUserBalanceLabelValue = () => {
	const { session } = useSession();

	return useQuery({
		...getUserBalanceOptions({
			session,
		}),
		select: useCallback((data: userBalances) => {
			return data?.currencyBalances?.map((type) => ({
				value: `${type.currency}`,
				label: `${type.currency}`,
			}));
		}, []),
	});
};
