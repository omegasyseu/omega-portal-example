import { createFileRoute } from "@tanstack/react-router";
import { requireSignIn } from "@/providers/authentication/require-sign-in.ts";

// Jackpot and Promotions are personal: logged-out visitors go to sign in and come back.
export const Route = createFileRoute("/_promotions")({
	beforeLoad: requireSignIn,
});
