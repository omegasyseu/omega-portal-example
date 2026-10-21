import { queryOptions } from "@tanstack/react-query";
import {
	type CredentialCheck,
	isCredentialTaken,
} from "@/components/auth/signup-model.ts";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

const CREDENTIAL_CHECK_STALE_MS = 60_000;

// The credentials IPS can look up before sign-up: an email or a mobile number.
export type CredentialField = "email" | "mobilePhone";

// Whether a player on the brand already uses this email or mobile number.
export const checkCredentialTaken = async ({
	field,
	value,
	brandId,
}: {
	field: CredentialField;
	value: string;
	brandId: string;
}) => {
	const res = await IPS_AXIOS_CLIENT.get<CredentialCheck>("/checkCredential", {
		params: { field, value, brandId },
	});
	return isCredentialTaken(res.data);
};

// Cached per brand and value, so leaving the field again doesn't ask IPS twice.
export const credentialCheckOptions = (params: {
	field: CredentialField;
	value: string;
	brandId: string;
}) =>
	queryOptions({
		queryKey: ["check-credential", params.field, params.brandId, params.value],
		queryFn: () => checkCredentialTaken(params),
		staleTime: CREDENTIAL_CHECK_STALE_MS,
		// A failed check shows nothing, so it shouldn't spin through retries first.
		retry: false,
	});
