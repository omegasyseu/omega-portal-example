import { queryOptions, useQuery } from "@tanstack/react-query";
import type { z } from "zod";
import {
	type Session,
	useSession,
} from "@/providers/authentication/authentication.tsx";
import {
	BASE_RESPONSE_SCHEMA,
	getConsentsResponseSchema,
} from "@/schemas-types";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

const consentSchema = BASE_RESPONSE_SCHEMA.merge(getConsentsResponseSchema);
type ConsentRes = z.infer<typeof consentSchema>;

const getConsents = async () => {
	const API = "/consents";
	try {
		const res = await IPS_AXIOS_CLIENT.get<ConsentRes>(API);
		const filteredConsents = res?.data?.consents?.filter(
			(consent) =>
				consent?.key === "MANDATORY" ||
				consent?.key === "MARKETING" ||
				consent?.isMandatory === true,
		);

		return {
			res: res.data,
			filteredConsents,
		};
	} catch (e) {
		console.error("Error fetching consents:", e);
		throw e;
	}
};

const getConsentsOptions = (session: Session) => {
	return queryOptions({
		queryKey: ["fetch-consents", { user: session?.user?.sessionKey }],
		queryFn: async () => await getConsents(),
		meta: {
			persist: true,
		},
	});
};

export const useGetConsents = () => {
	const { session } = useSession();
	return useQuery({
		...getConsentsOptions(session),
	});
};
