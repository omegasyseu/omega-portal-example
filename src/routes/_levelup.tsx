import { createFileRoute } from "@tanstack/react-router";
import { requireSignIn } from "@/providers/authentication/require-sign-in.ts";

// Level Up is personal: logged-out visitors go to sign in and come back.
export const Route = createFileRoute("/_levelup")({
	beforeLoad: requireSignIn,
});
