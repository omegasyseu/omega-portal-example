import { createFileRoute } from "@tanstack/react-router";
import { requireSignIn } from "@/providers/authentication/require-sign-in.ts";

// The player's own pages: logged-out visitors go to sign in and come back.
export const Route = createFileRoute("/_authenticated")({
	beforeLoad: requireSignIn,
});
