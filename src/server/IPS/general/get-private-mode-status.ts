import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { usePrimaryAccount } from "@/hooks/use-primary-account";
import { IPS_AXIOS_CLIENT } from "../IPS_CONFIG";

const responseSchema = z.object({
	privateMode: z.boolean(),
});
type Response = z.infer<typeof responseSchema>;

export const PRIVATE_MODE_QUERY_KEY = "privateMode";

const getPrivateModeStatus = async (
	sessionKey?: string | undefined,
): Promise<Response> => {
	const API = "/privateMode/status";
	const res = await IPS_AXIOS_CLIENT.get<Response>(API, {
		params: {
			sessionKey,
		},
	});
	return res.data;
};

export const getPrivateModeOptions = (sessionKey?: string | undefined) => {
	return queryOptions({
		queryKey: [PRIVATE_MODE_QUERY_KEY, sessionKey],
		queryFn: async () => await getPrivateModeStatus(sessionKey),
		enabled: !!sessionKey,
	});
};

// Read through the primary account, the one useChangePrivateModeStatus saves to.
export const useGetPrivateModeStatus = () => {
	const { sessionKey } = usePrimaryAccount();

	return useQuery({
		...getPrivateModeOptions(sessionKey),
	});
};
