import { queryOptions, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { z } from "zod";
import { IPS_AXIOS_CLIENT } from "../IPS_CONFIG";

const responseSchema = z.object({
	status: z.string(),
	currencies: z.array(z.string()),
});
type Response = z.infer<typeof responseSchema>;

const getBrandCurrencies = async (brandId?: string): Promise<Response> => {
	const API = "/getBrandCurrencies";
	const res = await IPS_AXIOS_CLIENT.get<Response>(API, {
		params: brandId ? { brandId } : {},
	});
	return res.data;
};

export const getBrandCurrenciesOptions = (brandId?: string) => {
	return queryOptions({
		queryKey: ["fetch-brand-currencies", brandId],
		queryFn: async () => await getBrandCurrencies(brandId),
		meta: { persist: true },
	});
};

export const useGetBrandCurrencies = (brandId?: string) => {
	return useQuery({
		...getBrandCurrenciesOptions(brandId),
		select: useCallback((data: Response) => {
			return data?.currencies?.map((c) => ({
				label: c,
				value: c,
			}));
		}, []),
	});
};
