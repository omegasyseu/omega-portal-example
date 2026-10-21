import { queryOptions, useQuery } from "@tanstack/react-query";
import type { z } from "zod";
import {
	type Session,
	useSession,
} from "@/providers/authentication/authentication.tsx";
import type { countriesResponseSchema } from "@/schemas-types";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

type countriesResponseTypes = z.infer<typeof countriesResponseSchema>;
const getCountries = async () => {
	const API = "/getCountries";
	try {
		const res = await IPS_AXIOS_CLIENT.get<countriesResponseTypes>(API);

		return res.data;
	} catch (e) {
		console.error("Error fetching countries:", e);
		throw e;
	}
};

const getCountriesOptions = (session: Session) => {
	return queryOptions({
		queryKey: ["fetch-countries", { user: session?.user?.sessionKey }],
		queryFn: async () => await getCountries(),
		meta: {
			persist: true,
		},
	});
};

export const useGetCountries = () => {
	const { session } = useSession();
	return useQuery({
		...getCountriesOptions(session),
	});
};
