import { Box } from "@mantine/core";
import { useSuspenseQuery } from "@tanstack/react-query";
import { formatedCountries } from "@/components/auth/constants";
import SignupForm from "@/components/auth/forms/signup.tsx";
import { useGetAllCurrenciesLabelAndValueSuspense } from "@/server/IPS/general/get-all-currencies.ts";
import { getCountryInfoOptions } from "@/server/IPS/general/get-country-info.ts";
import { getIpsBrandsOptions } from "@/server/IPS/general/get-ips-brands.ts";

// The registration form, starting from the visitor's country and its currency. It
// suspends while the brands (which settle the Selected Brand), country and currencies
// load.
export function SignupStep() {
	useSuspenseQuery({
		...getIpsBrandsOptions(),
	});
	const { data: countryInfo } = useSuspenseQuery({
		...getCountryInfoOptions(),
	});
	const { data: currencies } = useGetAllCurrenciesLabelAndValueSuspense();

	const initialCountry = formatedCountries.find(
		(c) => c.value === countryInfo?.countryInfo?.iso2Code.toLowerCase(),
	)?.value;
	const initialCurrency = currencies?.find((d) => {
		return (
			d.value.toLowerCase() === countryInfo?.currency?.isoCode.toLowerCase()
		);
	})?.value;

	const initialValues = {
		// Empty when the visitor's country or currency isn't one we offer.
		country: initialCountry ?? "",
		currency: initialCurrency ?? "",
	};

	return (
		<Box w={"100%"}>
			<SignupForm {...initialValues} />
		</Box>
	);
}
