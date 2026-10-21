import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { AuthModal } from "@/components/auth/auth-modal.tsx";
import { authSearchSchema } from "@/components/auth/auth-steps.ts";
import { CompleteRegistrationModal } from "@/components/auth/complete-registration/complete-registration-modal.tsx";
import { dialogSearchSchema } from "@/components/engage-dialog/engage-dialog.ts";
import { EngageDialogs } from "@/components/engage-dialog/engage-dialogs.tsx";
import { KycPromptModal } from "@/components/kyc/kyc-prompt-modal.tsx";
import { NothingFoundBackground } from "@/components/not-found/not-found.tsx";
import { ChronosPublicChannels } from "@/components/notifications/ChronosPublicChannels";
import { OmegaAppShell } from "@/layout/shell";
import type { UserAuthenticatedSession } from "@/providers/authentication/authentication.tsx";
import type { GeneralInfoContextType } from "@/providers/selected-currency-provider";
import SEO from "@/Seo.tsx";

const TanStackRouterDevtools = import.meta.env.PROD
	? () => null // Render nothing in production
	: lazy(() =>
			// Lazy load in development
			import("@tanstack/react-router-devtools").then((res) => ({
				default: res.TanStackRouterDevtools,
			})),
		);

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	authentication: UserAuthenticatedSession;
	generalInfo: GeneralInfoContextType;
}>()({
	component: RootComponent,
	notFoundComponent: NothingFoundBackground,
	// The sign-in dialog (?auth=login) and Jackpot or Challenges (?dialog=jackpot) open
	// over any page.
	validateSearch: authSearchSchema.merge(dialogSearchSchema),
});
function RootComponent() {
	return (
		<>
			<SEO title={"Portal 5"} />
			<OmegaAppShell>
				<Outlet />
			</OmegaAppShell>
			<AuthModal />
			<CompleteRegistrationModal />
			<KycPromptModal />
			<EngageDialogs />
			<ChronosPublicChannels />
			<ReactQueryDevtools buttonPosition="bottom-left" />
			<Suspense>
				<TanStackRouterDevtools position="bottom-right" />
			</Suspense>
		</>
	);
}
