import { useQuery } from "@tanstack/react-query";
import { usePrimaryAccount } from "@/hooks/use-primary-account";
import {
	GetResponsibleGamingLimitsResponseSchema,
	LIMIT_PERIODS,
	LIMIT_TYPES,
} from "@/schemas-types/responsible-gaming";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

export const RESPONSIBLE_GAMING_LIMITS_QUERY_KEY =
	"get-responsible-gaming-limits";

const getResponsibleGamingLimits = async (sessionKey: string) => {
	const API = "/getResponsibleGamingLimit";
	try {
		const res = await IPS_AXIOS_CLIENT.get(API, {
			params: {
				sessionKey,
				limitTypes: LIMIT_TYPES.join(","),
				periodTypes: LIMIT_PERIODS.join(","),
			},
		});
		return (
			GetResponsibleGamingLimitsResponseSchema.parse(res.data).limits ?? []
		);
	} catch (e) {
		console.error("Error fetching responsible gaming limits:", e);
		throw e;
	}
};

// Returns both ACTIVE and PENDING rows for every limit shown on the Responsible Gaming page.
export const useGetResponsibleGamingLimits = () => {
	const { sessionKey } = usePrimaryAccount();
	return useQuery({
		queryKey: [RESPONSIBLE_GAMING_LIMITS_QUERY_KEY, { sessionKey }],
		queryFn: () => getResponsibleGamingLimits(`${sessionKey}`),
		enabled: !!sessionKey,
		refetchOnWindowFocus: false,
	});
};
