import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrimaryAccount } from "@/hooks/use-primary-account";
import type {
	LimitPeriod,
	LimitType,
} from "@/schemas-types/responsible-gaming";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";
import { RESPONSIBLE_GAMING_LIMITS_QUERY_KEY } from "@/server/IPS/responsible-gaming/get-responsible-gaming-limits.ts";
import { showErrorToast } from "@/server/IPS/responsible-gaming/show-error-toast.tsx";

export type LimitChange = {
	limitType: LimitType;
	periodType: LimitPeriod;
	// null removes the limit
	limit: number | null;
};

type Props = LimitChange & {
	// Security code sent to the player's current contact details, when the brand requires it
	// (otp.player.components contains RESPONSIBLE_GAMING_LIMIT).
	mfaCode?: string;
};

// SAVED: the change is stored. CODE_REQUIRED: nothing is stored yet; a security code was sent to the player.
export type UpdateLimitResult = "SAVED" | "CODE_REQUIRED";

const MFA_CODE_PENDING = "MFA_CODE_PENDING";
const MFA_CODE_FAILED = "MFA_CODE_FAILED";

// A rejected amount is shown inline by the form that submitted it, not as a toast.
export const isRejectedAmount = (
	error: unknown,
	{ limit }: Props,
): error is IPSErrors =>
	limit !== null && error instanceof IPSErrors && error.hasFieldError("limit");

// Lowering a limit applies at once; raising or removing it becomes a PENDING row until the brand's cool-down ends.
// The backend only answers SUCCESS, so the limits are fetched again to show the result.
export const useUpdateResponsibleGamingLimit = () => {
	const { sessionKey } = usePrimaryAccount();
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["update-responsible-gaming-limit"],
		mutationFn: async ({
			limitType,
			periodType,
			limit,
			mfaCode,
		}: Props): Promise<UpdateLimitResult> => {
			const API = "/updateResponsibleGamingLimit";
			try {
				await IPS_AXIOS_CLIENT.post(API, {
					sessionKey,
					limitType,
					periodType,
					limit: limit === null ? "null" : String(limit),
					...(mfaCode && { mfaCode }),
				});
				return "SAVED";
			} catch (e) {
				if (e instanceof IPSErrors && e.status === MFA_CODE_PENDING) {
					return "CODE_REQUIRED";
				}
				console.error("Error updating responsible gaming limit:", e);
				throw e;
			}
		},
		onSuccess: (result, { limit }) => {
			if (result !== "SAVED") {
				return;
			}
			notifications.show({
				message: limit === null ? "Limit removal requested" : "Limit saved",
				color: "neon",
				icon: <IconCheck />,
			});
		},
		onError: (error, variables) => {
			if (error instanceof IPSErrors && error.status === MFA_CODE_FAILED) {
				notifications.show({
					message: "The security code is incorrect or has expired",
					color: "danger",
				});
			} else if (!isRejectedAmount(error, variables)) {
				showErrorToast(error, "Couldn't update limit");
			}
		},
		// Nothing changed while a code is pending, so the limits are only fetched again once a request settles otherwise.
		onSettled: async (result) => {
			if (result === "CODE_REQUIRED") {
				return;
			}
			await queryClient.invalidateQueries({
				queryKey: [RESPONSIBLE_GAMING_LIMITS_QUERY_KEY],
			});
		},
	});
};
