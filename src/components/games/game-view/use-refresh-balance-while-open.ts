import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { getUserBalanceOptions } from "@/server/IPS/user/get-user-balance.ts";
import { sportsbookBalanceRefetchInterval } from "./sportsbook-balance.ts";

// The provider's sportsbook takes bets from the player's wallet without telling the
// portal, so while it is open the header's balance is asked for again every few
// seconds. Nothing here reads the result, so the sportsbook doesn't re-render.
export const useRefreshBalanceWhileOpen = () => {
	const { session } = useSession();
	useQuery({
		...getUserBalanceOptions({ session }),
		refetchInterval: sportsbookBalanceRefetchInterval,
	});
};
