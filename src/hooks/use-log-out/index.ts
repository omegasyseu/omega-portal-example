import { useCallback } from "react";
import { sleep } from "@/components/auth/hooks/use-login.tsx";
import { router } from "@/main.tsx";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { useGeneralInfo } from "@/providers/selected-currency-provider";

// Lets the cookie removal land before the router re-checks the session on navigation
const COOKIE_SETTLE_MS = 200;

// Clears the local session and opens sign-in over the home page.
// Uses the router instance, not useRouter(), because SessionActivityChecker renders outside RouterProvider.
export const useLogOut = () => {
	const { logout } = useSession();
	const { deleteSelectedAccount } = useGeneralInfo();

	return useCallback(async () => {
		logout();
		deleteSelectedAccount();
		await sleep(COOKIE_SETTLE_MS);
		await router.invalidate();
		await router.navigate({
			to: "/",
			search: { auth: "login" },
			replace: true,
		});
	}, [logout, deleteSelectedAccount]);
};
