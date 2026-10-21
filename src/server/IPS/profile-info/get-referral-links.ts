import {
	queryOptions,
	useQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import type { z } from "zod";
import { useSession } from "@/providers/authentication/authentication.tsx";
import type { getReferraLinksSchema } from "@/schemas-types";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

type Params = {
	sessionKey?: string;
};

type Response = z.infer<typeof getReferraLinksSchema>;

const getReferralLinks = async ({ sessionKey }: Params) => {
	const API = "/getReferralLinks";
	try {
		const res = await IPS_AXIOS_CLIENT.get<Response>(API, {
			params: {
				sessionKey,
			},
		});
		return res.data;
	} catch (e) {
		console.error("Error fetching referral links:", e);
		throw e;
	}
};

export const referralLinksOptions = ({ sessionKey }: Params) => {
	return queryOptions({
		queryKey: ["getReferralLinks", { sessionKey }],
		queryFn: async () =>
			await getReferralLinks({
				sessionKey,
			}),
		enabled: !!sessionKey,
	});
};

export const useGetReferralLinks = () => {
	const { session } = useSession();
	return useQuery({
		...referralLinksOptions({
			sessionKey: session?.user?.sessionKey,
		}),
	});
};

export const useGetReferralLinksSuspense = () => {
	const { session } = useSession();
	return useSuspenseQuery({
		...referralLinksOptions({
			sessionKey: session?.user?.sessionKey,
		}),
	});
};
