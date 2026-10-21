import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
	type CredentialField,
	credentialCheckOptions,
} from "@/server/IPS/signup/check-credential.ts";

const TAKEN_MESSAGES: Record<CredentialField, string> = {
	email: "This email is already registered. Sign in instead?",
	mobilePhone: "This mobile number is already registered.",
};

// Checks an email or mobile with IPS as soon as the player leaves the field, as on Omega
// Wins, and again on submit if that check hasn't finished. `error` is the message to show
// when it's taken.
export const useCredentialCheck = (field: CredentialField, brandId: string) => {
	const queryClient = useQueryClient();
	const [value, setValue] = useState("");
	const query = useQuery({
		...credentialCheckOptions({ field, value, brandId }),
		enabled: value !== "" && brandId !== "",
	});

	// Called when the field loses focus with a value that passed its own validation.
	const check = (next: string) => setValue(next);

	// For submit: resolves to the taken message, or null when it's free.
	const verify = async (next: string) => {
		setValue(next);
		const isTaken = await queryClient.fetchQuery(
			credentialCheckOptions({ field, value: next, brandId }),
		);
		return isTaken ? TAKEN_MESSAGES[field] : null;
	};

	return {
		check,
		verify,
		isChecking: query.isFetching,
		isAvailable: query.data === false,
		error: query.data === true ? TAKEN_MESSAGES[field] : null,
		// Clears the result when the value changes, so a stale "available" doesn't linger.
		reset: () => setValue(""),
	};
};
