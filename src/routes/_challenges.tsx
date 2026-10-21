import { createFileRoute } from "@tanstack/react-router";
import { requireSignIn } from "@/providers/authentication/require-sign-in.ts";

// Challenges and Badges are personal: logged-out visitors go to sign in and come back.
export const Route = createFileRoute("/_challenges")({
	beforeLoad: requireSignIn,
});
