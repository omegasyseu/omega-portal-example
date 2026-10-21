import { useSession } from "@/providers/authentication/authentication.tsx";
import { useGetPlayerInfo } from "@/server/IPS/user/get-player-info.ts";
import { completeRegistrationDialog } from "./complete-registration-store.ts";

const QUICK_REG = "QUICK_REG";

// Whether a signed-in player still owes their name and address (QUICK_REG):
// "checking" until their player info has loaded.
export const useRegistrationState = () => {
	const { session } = useSession();
	const { data: playerInfo, isPending } = useGetPlayerInfo();
	if (!session?.user) return "complete";
	if (isPending) return "checking";
	return playerInfo?.registrationStatus === QUICK_REG ? "needed" : "complete";
};

export const useNeedsRegistration = () => useRegistrationState() === "needed";

// For actions a QUICK_REG player can't take yet (playing, paying): opens the dialog
// instead and reports that it did, so the caller stops.
export const useRequireRegistration = () => {
	const needsRegistration = useNeedsRegistration();
	return () => {
		if (!needsRegistration) return false;
		completeRegistrationDialog.open();
		return true;
	};
};
