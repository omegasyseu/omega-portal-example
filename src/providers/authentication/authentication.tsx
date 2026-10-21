import { createContext, type ReactNode, useCallback, useContext } from "react";
import { useCookies } from "react-cookie";
import { z } from "zod";
import { clearStorageKeepingSavedBrand } from "@/components/brand/saved-brand.ts";
import { useIsSessionActive } from "@/hooks/use-is-session-active";
import { forgetPrompts } from "@/utils/prompt-once.ts";

export const AssociatedAccountSchema = z.object({
	partyId: z.number(),
	currency: z.string(),
	sessionKey: z.string(),
	isPrimary: z.boolean(),
});

export type AssociatedAccount = z.infer<typeof AssociatedAccountSchema>;

export const LoggedInBrandSchema = z.object({
	id: z.number().optional(),
	name: z.string().optional(),
	isSocialBrand: z.boolean().optional(),
	socialType: z.string().optional(),
});

export type LoggedInBrand = z.infer<typeof LoggedInBrandSchema>;

export type Session = {
	user?: {
		sessionKey?: string;
		virtualCurrencies?: Record<string, { redeemable: boolean }>;
		realCurrencies?: Record<string, { redeemable: boolean }>;
		purchaseCurrencies?: string[];
		repurchaseCurrencies?: string[];
		associatedAccounts?: AssociatedAccount[];
		loggedInBrand?: LoggedInBrand;
	};
} | null;

export type UserAuthenticatedSession = {
	session: Session;
	logout: () => void;
	resetSession: () => void;
	setUser: (user: CookieData) => void;
};

const CookieDataSchema = z.object({
	sessionKey: z.string().optional(),
	associatedAccounts: z.array(AssociatedAccountSchema).optional(),
	loggedInBrand: LoggedInBrandSchema.optional(),
	virtualCurrencies: z
		.record(z.string(), z.object({ redeemable: z.boolean() }))
		.optional(),
	realCurrencies: z
		.record(z.string(), z.object({ redeemable: z.boolean() }))
		.optional(),
	purchaseCurrencies: z.array(z.string()).optional(),
	repurchaseCurrencies: z.array(z.string()).optional(),
});

export type CookieData = z.infer<typeof CookieDataSchema>;

export const AuthenticationContext = createContext<
	UserAuthenticatedSession | undefined
>(undefined);

export const AuthenticationProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [cookies, setCookie, removeCookie] = useCookies(["portal-5-user"]);
	const savedCookie = cookies["portal-5-user"];

	const result = CookieDataSchema.safeParse(savedCookie);

	const user = result.success ? result.data : undefined;

	const resetSession = useCallback(() => {
		removeCookie("portal-5-user");
		clearStorageKeepingSavedBrand();
		forgetPrompts();
	}, [removeCookie]);

	const logout = () => {
		resetSession();
	};

	const setUser = (userData: CookieData) => {
		try {
			// Validate the data before setting cookie
			const validationResult = CookieDataSchema.safeParse(userData);
			if (!validationResult.success) {
				console.error("Invalid user data:", validationResult.error);
				throw new Error("Invalid user data format");
			}
			setCookie("portal-5-user", validationResult.data);
		} catch (error) {
			console.error("Error in setUser:", error);
			throw error;
		}
	};

	return (
		<AuthenticationContext.Provider
			value={{
				session: user ? { user } : { user: undefined },
				logout,
				setUser,
				resetSession,
			}}
		>
			{children}
		</AuthenticationContext.Provider>
	);
};

export const SessionActivityChecker = () => {
	const { session } = useSession();
	useIsSessionActive({
		sessionKey: session?.user?.sessionKey,
	});

	return null;
};

export const useSession = () => {
	const context = useContext(AuthenticationContext);
	if (!context) {
		throw new Error("useSession must be used within an AuthenticationProvider");
	}
	return context;
};
