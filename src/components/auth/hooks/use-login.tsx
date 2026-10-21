import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import type { z } from "zod";
import { useCloseAuth } from "@/components/auth/hooks/use-auth-dialog.ts";
import {
	type CookieData,
	useSession,
} from "@/providers/authentication/authentication.tsx";
import type { MergedSchemas } from "@/schemas-types";
import { useGetIpsBrands } from "@/server/IPS/general/get-ips-brands.ts";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";
import { KYC_REFUSAL_LEAD } from "@/server/IPS/kyc-refusal.ts";
import { isSamePage, safeRedirectPath } from "@/utils/safe-redirect.ts";

type LoginMutation = {
	username: string;
	password: string;
	mfaCode?: string;
	brandId: string | undefined;
};
export async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
export type APILoginResponse = z.infer<typeof MergedSchemas>;
export const useLogin = () => {
	const { data: brands } = useGetIpsBrands();
	const { setUser } = useSession();
	const navigate = useNavigate();
	const pathname = useLocation({ select: (location) => location.pathname });
	const closeAuth = useCloseAuth();
	// Set when a guard or a gated link opened sign-in on the way to another page.
	const { redirect } = useSearch({ strict: false });
	const API = "/login";

	return useMutation({
		mutationKey: ["login"],
		mutationFn: async ({
			mfaCode,
			brandId,
			password,
			username,
		}: LoginMutation) => {
			// console.log({
			// 	password,
			// 	username,
			// 	mfaCode,
			// 	brandId,
			// });
			try {
				const res = await IPS_AXIOS_CLIENT.post<APILoginResponse>(API, {
					username,
					password,
					...(mfaCode && {
						mfaCode,
					}),
					...(brandId && {
						brandId,
					}),
				});
				return res.data;
			} catch (e) {
				// biome-ignore lint/complexity/noUselessCatch: kept as a placeholder for error handling
				throw e;
			}
		},
		onSuccess: async (data) => {
			// console.log({
			// 	loggedInbrand: data,
			// 	demo: brands?.sortedBrands,
			// });
			const findBrand = brands?.res?.brands?.find(
				(brand) => brand.id === data?.brandId,
			);

			const value: CookieData = {
				loggedInBrand: findBrand,
				virtualCurrencies: findBrand?.socialCurrency?.virtual,
				realCurrencies: findBrand?.socialCurrency?.real,
				purchaseCurrencies: findBrand?.socialCurrency?.purchaseCurrencies,
				repurchaseCurrencies: findBrand?.socialCurrency?.repurchaseCurrencies,
				associatedAccounts: data.associateAccounts,
				sessionKey: data?.sessionKey,
			};

			try {
				setUser(value);
				console.log("User set successfully");
			} catch (error) {
				console.error("Failed to set user:", error);
				return;
			}

			await sleep(200);

			// Replace the dialog's history entry, so Back doesn't reopen it. Back on the
			// same page (with Jackpot or Challenges opening on it) it stays scrolled where it
			// was; another page starts at the top.
			const returnTo = safeRedirectPath(redirect);
			if (returnTo) {
				await navigate({
					href: returnTo,
					replace: true,
					resetScroll: !isSamePage(returnTo, pathname),
				});
				return;
			}
			// Otherwise the player stays on the page the dialog opened over.
			closeAuth();
		},
		onError: (error) => {
			if (error instanceof IPSErrors) {
				notifications.show({
					// A player refused sign-in can't reach their profile, so a KYC refusal
					// doesn't point there.
					message: error.isKycRefusal
						? KYC_REFUSAL_LEAD
						: error.message || error.formatErrors(),
				});
				console.log({
					error: error.formatErrors(),
				});
			} else {
				notifications.show({
					message: "An unexpected error occurred",
				});
				console.log({
					error: error.message,
				});
			}
		},
	});
};
