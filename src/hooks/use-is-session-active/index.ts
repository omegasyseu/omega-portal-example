import { useQuery } from "@tanstack/react-query";
import { useLogOut } from "@/hooks/use-log-out";
import { IPS_AXIOS_CLIENT_NO_INTERCEPTOR } from "@/server/IPS/IPS_CONFIG.ts";

type Res = {
	alive: string;
};
const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useIsSessionActive = ({ sessionKey }: { sessionKey?: string }) => {
	const API = "/checkSessionAlive";
	const logOut = useLogOut();
	return useQuery({
		queryKey: ["check-session", { sessionKey }],
		queryFn: async () => {
			try {
				const res = await IPS_AXIOS_CLIENT_NO_INTERCEPTOR.get<Res>(API, {
					params: {
						sessionKey,
					},
				});
				if (res.data.alive !== "true") {
					throw new Error("Session is not active");
				}
				return res.data;
			} catch (e) {
				if (e) {
					await logOut();
				}
				// The message only: an AxiosError's config.params holds the session key.
				console.error(
					"Error fetching active session:",
					e instanceof Error ? e.message : e,
				);
				throw e;
			}
		},
		enabled: !!sessionKey,
		staleTime: FIVE_MINUTES, // Data becomes stale after 5 minutes
		refetchInterval: FIVE_MINUTES, // Refetch every 5 minutes
		refetchIntervalInBackground: true, // Refetch even when the tab is in the background
		retry: false,
		// Keep the cache fresh for 24 hours
		gcTime: 1000 * 60 * 60 * 24,
	});
};
