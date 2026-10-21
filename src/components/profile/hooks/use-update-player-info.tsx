import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useSession } from "@/providers/authentication/authentication";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG";
import { ipsErrorMessage } from "@/server/IPS/ips-error-toast.tsx";

// Only the changed fields are sent: /updatePlayerInfo leaves every field it does not receive untouched.
export type ProfileChange = {
	firstName?: string;
	lastName?: string;
	// "1988-06-21", as IPS reads it.
	birthDate?: string;
	email?: string;
	mobilePhone?: string;
	phone?: string;
	address?: string;
	streetNumber?: string;
	postalCode?: string;
	city?: string;
	province?: string;
	country?: string;
	languageCode?: string;
	gender?: string;
};

type UpdateRequest = ProfileChange & {
	// Security code sent to the player's CURRENT contact details, when the brand requires it
	// (otp.player.components contains UPDATE_PLAYER_INFO).
	mfaCode?: string;
};

// SAVED: the change is stored. CODE_REQUIRED: nothing is stored yet; a security code was sent to the current contact.
export type UpdatePlayerInfoResult = "SAVED" | "CODE_REQUIRED";

const MFA_CODE_PENDING = "MFA_CODE_PENDING";
const MFA_CODE_FAILED = "MFA_CODE_FAILED";

export const useUpdatePlayerInfo = () => {
	const { session } = useSession();
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["update-player-info"],
		mutationFn: async (
			request: UpdateRequest,
		): Promise<UpdatePlayerInfoResult> => {
			const API = "/updatePlayerInfo";
			try {
				await IPS_AXIOS_CLIENT.post(API, request, {
					params: {
						sessionKey: session?.user?.sessionKey,
					},
				});
				return "SAVED";
			} catch (e) {
				if (e instanceof IPSErrors && e.status === MFA_CODE_PENDING) {
					return "CODE_REQUIRED";
				}
				console.error("Error updating player info:", e);
				throw e;
			}
		},
		onSuccess: async (result) => {
			if (result === "SAVED") {
				await queryClient.invalidateQueries({
					queryKey: ["player-info"],
				});
			}
		},
		onError: (error) => {
			let message: ReactNode = "An unexpected error occurred";
			if (error instanceof IPSErrors) {
				message =
					error.status === MFA_CODE_FAILED
						? "The security code is incorrect or has expired"
						: ipsErrorMessage(error, error.formatErrors() || error.message);
			}
			notifications.show({
				message,
				color: "danger",
				icon: <IconX />,
			});
		},
	});
};
