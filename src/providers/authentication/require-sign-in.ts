import { type ParsedLocation, redirect } from "@tanstack/react-router";
import type { UserAuthenticatedSession } from "@/providers/authentication/authentication.tsx";

type GuardOptions = {
	context: { authentication: UserAuthenticatedSession };
	location: ParsedLocation;
};

// Route guard for pages that need a logged-in player, opened by URL. Anyone else lands
// on the home page with sign-in open, and goes on to the page they asked for once
// signed in. (The shell's links open sign-in over the current page before getting here.)
export const requireSignIn = ({
	context: { authentication },
	location,
}: GuardOptions) => {
	if (!authentication?.session?.user) {
		throw redirect({
			to: "/",
			search: { auth: "login", redirect: location.href },
		});
	}
};
