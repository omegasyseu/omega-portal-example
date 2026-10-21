import { useSession } from "@/providers/authentication/authentication.tsx";

// Responsible gaming limits, self-exclusion and Private Mode always act on the primary
// account, whichever currency account is currently selected.
export const usePrimaryAccount = () => {
	const { session } = useSession();
	const accounts = session?.user?.associatedAccounts;
	const primary = accounts?.find((account) => account.isPrimary);

	return {
		sessionKey: primary?.sessionKey ?? session?.user?.sessionKey,
		currency: primary?.currency,
	};
};
