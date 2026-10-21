import { createFileRoute, redirect } from "@tanstack/react-router";
import { authStepForPath } from "@/components/auth/auth-steps.ts";

// The sign-in flow's old pages. The flow is now a dialog over any page, so links and
// emails that still point here open it over the home page at the same step.
export const Route = createFileRoute("/_auth")({
	beforeLoad: ({ location, search }) => {
		throw redirect({
			to: "/",
			search: { ...search, auth: authStepForPath(location.pathname) },
			replace: true,
		});
	},
});
