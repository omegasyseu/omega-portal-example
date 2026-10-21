import {
	keepPreviousData,
	queryOptions,
	useQuery,
} from "@tanstack/react-query";
import { useSession } from "@/providers/authentication/authentication.tsx";
import type { cashbackschemaType } from "@/schemas-types/cashback";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";
import type { GeneralRequestType } from "@/server/IPS/user/get-player-info.ts";

const getUserCashbackBalance = async ({ session }: GeneralRequestType) => {
	const API = "getCashbackBalance";

	try {
		const res = await IPS_AXIOS_CLIENT.get<cashbackschemaType>(API, {
			params: {
				sessionKey: session?.user?.sessionKey,
			},
		});
		const response = res.data;
		const modifiedData = {
			cashbackPlayerAvailable: response?.cashbackPlayerAvailable,
			cashbackAvailable: response?.cashbackAvailable,
			cashbackAwarded: response?.cashbackAwarded,
			cashbackClaimed: response?.cashbackClaimed,
			cashbackAccumulated: response?.cashbackAccumulated,
			cashbackExpired: response?.cashbackExpired,

			currency: response?.currency ?? "",
			planBalances: response?.planBalances?.map((plan) => {
				return {
					label: `Plan ${plan?.cashbackPlanId ?? ""}`,
					value: `${plan?.cashbackPlanId ?? ""}`,
					cashbackAccumulated: plan?.cashbackAccumulated ?? 0,
					cashbackAvailable: plan?.cashbackAvailable ?? 0,
					cashbackAwarded: plan?.cashbackAwarded ?? 0,
					cashbackClaimed: plan?.cashbackClaimed ?? 0,
					cashbackExpired: plan?.cashbackExpired ?? 0,
					cashbackPlanId: plan?.cashbackPlanId ?? 0,
					currency: plan?.currency ?? "",
					partyId: plan?.partyId ?? 0,
					cashbackPlanName: plan?.cashbackPlanName,
					cashbackPlanType: plan?.cashbackPlanType,
					isPlayerRedeemable: plan?.isPlayerRedeemable,
					redemptionTriggerType: plan?.redemptionTriggerType,
					cashbackPlayerAvailable: plan?.cashbackPlayerAvailable,
					cashbackPendingAvailable: plan?.cashbackPendingAvailable,
					cashbackNotEligible: plan?.cashbackNotEligible,
					minimumClaimAmount: plan?.minimumClaimAmount,
					claimCount: plan?.claimCount,
					handle: plan?.handle,
					totalHandle: plan?.totalHandle,
					planStatus: plan?.planStatus,
					limitPerPlayer: plan?.limitPerPlayer,
					limitUsed: plan?.limitUsed,
				};
			}),
		};
		return modifiedData;
	} catch (e) {
		console.error("Error fetching cashback balance:", e);
		throw e;
	}
};

export const getUserCashbackOptions = ({ session }: GeneralRequestType) => {
	return queryOptions({
		queryKey: ["IPS_CASHBACK", { user: session?.user?.sessionKey }],
		queryFn: async () => await getUserCashbackBalance({ session }),
		enabled: !!session?.user && !!session?.user?.sessionKey,
	});
};

export const useGetCashback = () => {
	const { session } = useSession();
	return useQuery({
		...getUserCashbackOptions({
			session,
		}),
		placeholderData: keepPreviousData,
		refetchInterval: 10_000,
	});
};
