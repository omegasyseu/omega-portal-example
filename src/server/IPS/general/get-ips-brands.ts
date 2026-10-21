import { queryOptions, useQuery } from "@tanstack/react-query";
import type { GetBrandsResponse } from "@/schemas-types";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

export const getIpsBrands = async () => {
	try {
		const res = await IPS_AXIOS_CLIENT.get<GetBrandsResponse>("/getBrands");
		const BrandsLabelAndValue = res?.data?.brands?.map((brand) => {
			return {
				label: brand.name,
				value: `${brand.id}`,
			};
		});
		const brandLabelAndValueSorted = res?.data?.brands
			?.map((brand) => {
				return {
					label: brand.name,
					value: `${brand.id}`,
				};
			})
			.sort((a, b) => Number(a.value) - Number(b.value));

		// res.brands keeps IPS's order, which picks a first visit's Brand; never sort it
		// in place, as that would reorder the cached response too.
		return {
			res: res.data,
			selectValues: BrandsLabelAndValue,
			brandLabelAndValueSorted,
		};
	} catch (e) {
		console.log("Error fetching IPS brands:", e);
		throw e;
	}
};

export const getIpsBrandsOptions = () => {
	return queryOptions({
		queryKey: ["IPS_BRANDS"],
		queryFn: async () => await getIpsBrands(),
		meta: {
			persist: true,
		},
	});
};

export const useGetIpsBrands = () => {
	return useQuery({
		...getIpsBrandsOptions(),
	});
};
