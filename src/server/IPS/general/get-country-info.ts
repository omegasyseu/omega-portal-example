import { queryOptions, useQuery } from "@tanstack/react-query";
import type { UserCountryType } from "@/schemas-types";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

const getCountryInfo = async () => {
	const API = "/getCountryInfo";
	try {
		const res = await IPS_AXIOS_CLIENT.get<UserCountryType>(API);

		return res.data;
	} catch (e) {
		console.error("Error fetching country info:", e);
		throw e;
	}
};

export const getCountryInfoOptions = () => {
	return queryOptions({
		queryKey: ["fetch-country-nfo"],
		queryFn: async () => await getCountryInfo(),
		meta: {
			persist: true,
		},
	});
};

export const useGetCountryInfo = () => {
	return useQuery({
		...getCountryInfoOptions(),
	});
};
