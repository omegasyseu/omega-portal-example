import { createFileRoute, redirect } from "@tanstack/react-router";

// The Challenges' old page. Challenges is now a dialog over any page, so links that still
// point here open it over the home page.
export const Route = createFileRoute("/_challenges/challenges/")({
	beforeLoad: () => {
		throw redirect({
			to: "/",
			search: { dialog: "challenges" },
			replace: true,
		});
	},
});
