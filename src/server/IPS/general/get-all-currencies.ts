import { queryOptions, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { z } from "zod";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

const responseSchema = z.object({
	status: z.string(),
	currencies: z.array(z.string()),
});
export type CurrenciesResponse = z.infer<typeof responseSchema>;

const getAllCurrencies = async () => {
	const API = "/getCurrencies";
	try {
		const res = await IPS_AXIOS_CLIENT.get<CurrenciesResponse>(API);

		return res.data;
	} catch (e) {
		console.error("Error fetching all currencies:", e);
		throw e;
	}
};

export const getAllCurrenciesOptions = () => {
	return queryOptions({
		queryKey: ["fetch-currencies-info"],
		queryFn: async () => await getAllCurrencies(),
		meta: {
			persist: true,
		},
	});
};

export const useGetAllCurrencies = () => {
	return useQuery({
		...getAllCurrenciesOptions(),
	});
};

export const useGetAllCurrenciesLabelAndValue = () => {
	return useQuery({
		...getAllCurrenciesOptions(),
		select: useCallback((data: CurrenciesResponse) => {
			return data?.currencies?.map((c) => ({
				label: c,
				value: c,
			}));
		}, []),
	});
};

export const useGetAllCurrenciesLabelAndValueSuspense = () => {
	return useQuery({
		...getAllCurrenciesOptions(),
		select: useCallback((data: CurrenciesResponse) => {
			return data?.currencies?.map((c) => ({
				label: c,
				value: c,
			}));
		}, []),
	});
};

const getBrandCurrencies = async ({ brandId }: { brandId?: string }) => {
	const API = `/getBrandCurrencies?brandId=${brandId}`;
	try {
		const res = await IPS_AXIOS_CLIENT.get<CurrenciesResponse>(API);
		return res.data;
	} catch (e) {
		console.error("Error fetching all currencies:", e);
		throw e;
	}
};

export const getBrandCurrenciesOptions = ({
	brandId,
}: {
	brandId?: string;
}) => {
	return queryOptions({
		queryKey: ["fetch-brand-currencies", { brandId }],
		queryFn: async () => await getBrandCurrencies({ brandId }),
	});
};

export const useGetCurrenciesByBrand = ({ brandId }: { brandId?: string }) => {
	return useQuery({
		...getBrandCurrenciesOptions({ brandId }),
		select: useCallback((data: CurrenciesResponse) => {
			return data?.currencies?.map((c) => ({
				label: c,
				value: c,
			}));
		}, []),
	});
};
