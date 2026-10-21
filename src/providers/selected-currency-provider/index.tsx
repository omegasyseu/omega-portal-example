import { Text } from "@mantine/core";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
} from "react";
import { useCookies } from "react-cookie";
import type { z } from "zod";
import { useFormat } from "@/hooks/use-format";
import {
	AssociatedAccountSchema,
	useSession,
} from "@/providers/authentication/authentication.tsx";

export interface CookieSetOptions {
	path?: string;
	expires?: Date;
	maxAge?: number;
	domain?: string;
	secure?: boolean;
	httpOnly?: boolean;
	sameSite?: boolean | "none" | "lax" | "strict";
	partitioned?: boolean;
}
// Define the Zod schema for AssociatedAccount

export type AssociatedAccount = z.infer<typeof AssociatedAccountSchema>;

export type GeneralInfoContextType = {
	setSelectedAccount: (
		name: "portal-5-selected-account",
		value: AssociatedAccount,
		opts?: CookieSetOptions,
	) => void;
	selectedAccount?: AssociatedAccount;
	deleteSelectedAccount: () => void;
	// JSX
	selectedCurrency: () => ReactNode;
};

const CurrentCurrencyContext = createContext<
	GeneralInfoContextType | undefined
>(undefined);

type Props = {
	children: ReactNode;
};

export const GeneralInfoProvider = ({ children }: Props) => {
	const { formatCurrencyFromMap } = useFormat();

	const { session } = useSession();
	const [selectedAccount, setSelectedAccount, deleteSelectedAccount] =
		useCookies(["portal-5-selected-account"]);

	const selectedAccountCurrency = useMemo(() => {
		if (
			!selectedAccount["portal-5-selected-account"] &&
			session?.user?.associatedAccounts?.length
		) {
			// Find the primary account
			const primaryAccount = session.user.associatedAccounts.find(
				(account) => account.isPrimary,
			);
			const initialAccount =
				primaryAccount || session.user.associatedAccounts[0];
			const result = AssociatedAccountSchema.safeParse(initialAccount);

			if (result.success) {
				setSelectedAccount("portal-5-selected-account", result.data);
				return result.data;
			}
			console.error("Invalid initial account data", result.error);
			return undefined;
		}

		const savedAccount = selectedAccount["portal-5-selected-account"];
		const result = AssociatedAccountSchema.safeParse(savedAccount);

		if (result.success) {
			return result.data;
		}
		console.error("Invalid saved account data", result.error);
		return undefined;
	}, [selectedAccount, session, setSelectedAccount]);

	const deleteAccount = useCallback(() => {
		deleteSelectedAccount("portal-5-selected-account");
	}, [deleteSelectedAccount]);

	const defaultCurrency = useCallback(() => {
		return (
			<Text component={"span"} fz={"xs"}>
				{formatCurrencyFromMap(selectedAccountCurrency?.currency)}
			</Text>
		);
	}, [formatCurrencyFromMap, selectedAccountCurrency?.currency]);

	const value = useMemo(
		() => ({
			setSelectedAccount,
			selectedAccount: selectedAccountCurrency,
			deleteSelectedAccount: deleteAccount,
			selectedCurrency: defaultCurrency,
		}),
		[
			selectedAccountCurrency,
			setSelectedAccount,
			deleteAccount,
			defaultCurrency,
		],
	);

	return (
		<CurrentCurrencyContext.Provider value={value}>
			{children}
		</CurrentCurrencyContext.Provider>
	);
};

export const useGeneralInfo = () => {
	const context = useContext(CurrentCurrencyContext);
	if (!context) {
		throw new Error(
			"useGeneralInfo must be used within an GeneralInfoProvider",
		);
	}
	return context;
};
