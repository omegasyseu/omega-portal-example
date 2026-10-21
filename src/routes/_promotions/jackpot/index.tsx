import { createFileRoute, redirect } from "@tanstack/react-router";

// The Jackpot's old page. Jackpot is now a dialog over any page, so links that still
// point here open it over the home page.
export const Route = createFileRoute("/_promotions/jackpot/")({
	beforeLoad: () => {
		throw redirect({ to: "/", search: { dialog: "jackpot" }, replace: true });
	},
});
