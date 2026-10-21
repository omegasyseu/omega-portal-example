import "./global.css";
import "@fontsource-variable/outfit";
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import "@/providers/mantine-theme/light-mode.css";

import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	type AsyncStorage,
	experimental_createQueryPersister,
	type PersistedQuery,
} from "@tanstack/react-query-persist-client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { createStore, del, get, set, type UseStore } from "idb-keyval";
import React from "react";
import { CookiesProvider } from "react-cookie";
import ReactDOM from "react-dom/client";
import { useSelectedBrand } from "@/components/brand/use-selected-brand.ts";
import { PageLoadError } from "@/components/not-found/page-load-error.tsx";
import { trackPaymentOrigin } from "@/components/payments/payment-origin.ts";
import {
	AuthenticationProvider,
	SessionActivityChecker,
	useSession,
} from "@/providers/authentication/authentication.tsx";
import { BrandContentProvider } from "@/providers/brand-content/brand-content-provider.tsx";
import {
	GeneralInfoProvider,
	useGeneralInfo,
} from "@/providers/selected-currency-provider";
import { routeTree } from "@/routeTree.gen.ts";

function newIdbStorage(idbStore: UseStore): AsyncStorage<PersistedQuery> {
	return {
		getItem: async (key) => await get(key, idbStore),
		setItem: async (key, value) => await set(key, value, idbStore),
		removeItem: async (key) => await del(key, idbStore),
	};
}
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 0,
			// gcTime: 1000 * 60 * 60 * 24, // 24 hours
			// staleTime: 1000 * 60 * 60, // one hour

			refetchOnReconnect: true,
			persister:
				typeof window !== "undefined"
					? experimental_createQueryPersister<PersistedQuery>({
							storage: newIdbStorage(
								createStore("PORTAL_5", "PORTAL_5_DB_PERSISTER"),
							),
							maxAge: 1000 * 60 * 60 * 24, // 12 hours,
							serialize: (persistedQuery) => persistedQuery,
							deserialize: (cached) => cached,
							filters: {
								predicate: (query) => {
									return query.meta?.persist === true;
								},
							},
						}).persisterFn
					: undefined,
		},
	},
});

export const router = createRouter({
	routeTree,

	// Never the raw error: TanStack's own error screen would print IPS's message. The
	// error goes to the console for whoever is debugging.
	defaultErrorComponent: PageLoadError,
	defaultOnCatch: (error) => console.error("Page failed to load", error),
	context: {
		queryClient,
		// biome-ignore lint/style/noNonNullAssertion: set by RouterProvider context in App
		authentication: undefined!,
		// biome-ignore lint/style/noNonNullAssertion: set by RouterProvider context in App
		generalInfo: undefined!,
	},
	defaultPreload: "intent",
	defaultPreloadStaleTime: 0,
});

trackPaymentOrigin(router);

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
	interface HistoryState {
		// The page a game was opened from, for the game page's Back button.
		gameFrom?: string;
		// This entry opened the sign-in dialog, so closing it can step back.
		isAuthOpen?: boolean;
		// This entry opened Jackpot or Challenges, so closing it can step back.
		isDialogOpen?: boolean;
	}
}

function App() {
	const authentication = useSession();
	const generalInfo = useGeneralInfo();

	return (
		<RouterProvider
			router={router}
			defaultPreload="intent"
			context={{
				authentication,
				generalInfo,
			}}
		/>
	);
}
const AppWrapper = () => {
	// useIsSessionActive();
	return <App />;
};

// The portal in the Selected Brand's theme, with its content from Strapi.
const BrandedApp = () => {
	const { state } = useSelectedBrand();
	return (
		<BrandContentProvider selected={state}>
			<ModalsProvider>
				<Notifications position="top-right" zIndex={1000} limit={5} />
				<AppWrapper />
			</ModalsProvider>
		</BrandContentProvider>
	);
};

// biome-ignore lint/style/noNonNullAssertion: #root is in index.html
ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<CookiesProvider
				defaultSetOptions={{
					path: "/",
				}}
			>
				<AuthenticationProvider>
					<GeneralInfoProvider>
						<SessionActivityChecker />
						<BrandedApp />
					</GeneralInfoProvider>
				</AuthenticationProvider>
			</CookiesProvider>
		</QueryClientProvider>
	</React.StrictMode>,
);
