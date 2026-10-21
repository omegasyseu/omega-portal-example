import { useRegistrationState } from "@/components/auth/complete-registration/use-needs-registration.ts";
import { useGetPlayerInfo } from "@/server/IPS/user/get-player-info.ts";
import { kycState } from "./kyc-state.ts";

// Whether to point a signed-in player at KYC: their brand is asking for something (Action
// Needed) and registration is complete, so they're never asked for two things at once.
export const useNeedsKycAction = () => {
	const isRegistered = useRegistrationState() === "complete";
	const { data: playerInfo } = useGetPlayerInfo();
	return (
		isRegistered &&
		!!playerInfo &&
		kycState(playerInfo.kycStatus) === "actionNeeded"
	);
};
