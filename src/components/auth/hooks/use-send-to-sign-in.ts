import { useOpenAuth } from "@/components/auth/hooks/use-auth-dialog.ts";

// Opens sign-in over the page a logged-out visitor is on, for actions such as Play or
// Favourite; once signed in they stay on that page.
export const useSendToSignIn = () => {
	const openAuth = useOpenAuth();
	return () => openAuth("login");
};
