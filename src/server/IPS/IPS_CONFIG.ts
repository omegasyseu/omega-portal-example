import { notifications } from "@mantine/notifications";
import axios, { type AxiosError, type AxiosResponse } from "axios";
import { z } from "zod";
import { sleep } from "@/components/auth/hooks/use-login.tsx";
import { clearStorageKeepingSavedBrand } from "@/components/brand/saved-brand.ts";
import { router } from "@/main";
import { API_CFG } from "@/server/config.ts";
import { isKycRefusal, KYC_REFUSAL_MESSAGE } from "@/server/IPS/kyc-refusal.ts";
import { forgetPrompts } from "@/utils/prompt-once.ts";
import { pageToReturnTo } from "@/utils/safe-redirect.ts";

const { IPS_API } = API_CFG;

export const IPS_AXIOS_CLIENT = axios.create({
	baseURL: IPS_API,
	headers: {
		"Access-Control-Allow-Origin": "*",
		Accept: "application/json, text/plain, */*",
		"Content-Type": "application/x-www-form-urlencoded",
	},
});
export const IPS_AXIOS_CLIENT_NO_INTERCEPTOR = axios.create({
	baseURL: IPS_API,
	headers: {
		"Access-Control-Allow-Origin": "*",
		Accept: "application/json, text/plain, */*",
		"Content-Type": "application/x-www-form-urlencoded",
	},
});

export const ApiResponseSchema = z.object({
	suggestions: z.record(z.string(), z.array(z.string())).optional(),
	additionalInfo: z
		.array(
			z.object({
				key: z.string(),
				value: z.string(),
			}),
		)
		.optional(),
	errors: z
		.array(
			z.object({
				field: z.string(),
				error: z.string(),
			}),
		)
		.optional(),
	status: z.string().optional(),
	code: z.string().optional(),
	message: z.string().nullable().optional(),
});
export type APIResponse = z.infer<typeof ApiResponseSchema>;
export type ConstructorInputType = {
	response: unknown;
	message: string;
	name: string;
	status?: string;
};

type ValidatedResponseType = z.infer<typeof ApiResponseSchema>;

export class IPSErrors extends Error {
	suggestions?: { [key: string]: string[] };
	additionalInfo?: Array<{ key: string; value: string }>;

	errors?: Array<{ field: string; error: string }>;
	status?: string;
	// The backend's own message, unlike `message` which falls back to a generic text
	backendMessage?: string;
	// IPS refused the action over KYC; the message is then KYC_REFUSAL_MESSAGE
	isKycRefusal = false;

	constructor({ response, message, name, status }: ConstructorInputType) {
		super(message);
		this.name = name;
		this.status = status;

		// Validate the response using Zod
		const parsedResponse = ApiResponseSchema.safeParse(response);

		let validatedResponse: ValidatedResponseType | undefined;
		if (parsedResponse.success) {
			validatedResponse = parsedResponse.data;
			this.suggestions = validatedResponse.suggestions;
			this.additionalInfo = validatedResponse.additionalInfo;
			// Every KYC refusal reads the same, whichever action IPS refused and whichever
			// of these the caller shows.
			const isKyc = isKycRefusal(validatedResponse);
			this.isKycRefusal = isKyc;
			this.errors = isKyc ? undefined : validatedResponse.errors;
			this.backendMessage = isKyc
				? KYC_REFUSAL_MESSAGE
				: validatedResponse.message || undefined;
			if (isKyc) this.message = KYC_REFUSAL_MESSAGE;
		} else {
			console.error("Invalid API response:", parsedResponse.error.issues);
		}
	}

	formatErrors(): string {
		if (this.errors && Array.isArray(this.errors)) {
			return this.errors.map((err) => `${err.field}: ${err.error}`).join("\n");
		}
		return this.message;
	}

	hasFieldError(field: string): boolean {
		return !!this.errors?.some((err) => err.field === field);
	}
}

const handleLogout = async (message?: string) => {
	if (message) {
		notifications.show({
			id: "session-expired",
			color: "danger",
			title: "Session Expired",
			message: message,
			autoClose: false,
			withCloseButton: true,
		});
	}

	// biome-ignore lint/suspicious/noDocumentCookie: runs outside React; the Cookie Store API is not in every supported browser
	document.cookie =
		"portal-5-user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	// biome-ignore lint/suspicious/noDocumentCookie: runs outside React; the Cookie Store API is not in every supported browser
	document.cookie =
		"portal-5-selected-account=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	clearStorageKeepingSavedBrand();
	forgetPrompts();

	// Signing in again returns the player to the page where the session ran out. Read it
	// before invalidating: the reload can run a route guard that already moved to sign-in.
	const redirect = pageToReturnTo(router.state.location);

	await sleep(200);
	await router.invalidate();
	// The page may need a session, so sign-in opens over the home page.
	await router.navigate({
		to: "/",
		search: { auth: "login", redirect },
		replace: true,
	});
};

// Add a response interceptor
IPS_AXIOS_CLIENT.interceptors.response.use(
	(response: AxiosResponse<APIResponse>) => {
		const status = response.data.status;

		if (status === "SUCCESS" || status === "CONTINUE_TO_PAYMENT_SITE") {
			return response;
		}

		if (status === "NOT_LOGGED_IN_ERROR") {
			handleLogout(
				response.data.message ||
					"Your session has expired. Please log in again.",
			);
		}

		throw new IPSErrors({
			response: response.data,
			message: response.data.message || "Request failed",
			name: "APIError",
			status: response.data.status,
		});
	},
	(error: AxiosError<APIResponse>) => {
		if (error.response) {
			if (error.response.data.status === "NOT_LOGGED_IN_ERROR") {
				handleLogout(
					error.response.data.message ||
						"Your session has expired. Please log in again.",
				);
			}

			throw new IPSErrors({
				response: error.response.data,
				message: error.response.data.message || "An error occurred",
				name: "APIError",
				status: error.response.data.status,
			});
		}
		if (!error.request) {
			throw new Error("Error setting up the request");
		}
		throw new Error("No response received from the server");
	},
);
