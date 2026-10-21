import { mandatoryConsents } from "@/components/auth/signup-model.ts";
import { useGetConsents } from "@/server/IPS/general/get-consents.ts";

// The consents a sign-up asks for. Until they have loaded nobody knows which are
// mandatory, so a sign-up waits: a failed request must not read as "none required".
export const useSignupConsents = () => {
	const { data, isError, isFetching, refetch } = useGetConsents();
	const consentList = data?.filteredConsents ?? [];
	return {
		consentList,
		...mandatoryConsents(consentList),
		isLoaded: data !== undefined,
		hasFailed: isError && data === undefined,
		isRetrying: isFetching,
		retry: () => refetch(),
	};
};

export type SignupConsents = ReturnType<typeof useSignupConsents>;
