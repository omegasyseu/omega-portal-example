import { notifications } from "@mantine/notifications";
import { IconLock } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useLogOut } from "@/hooks/use-log-out";
import { usePrimaryAccount } from "@/hooks/use-primary-account";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";
import { showErrorToast } from "@/server/IPS/responsible-gaming/show-error-toast.tsx";

export type SelfExclusionUnit = "WEEK" | "MONTH";

export type SelfExclusionRequest = {
	lockPeriod: number;
	lockPeriodUnit: SelfExclusionUnit;
	// Shown to the player after the lock; the backend works out the exact end time itself
	lockedUntil: string;
};

type Props = SelfExclusionRequest & {
	// Security code sent to the player's current contact details, when the brand requires one
	// for self-exclusion. Same flow as a limit change or a profile update.
	mfaCode?: string;
};

// LOCKED: the account is locked. CODE_REQUIRED: nothing is locked yet; a security code was sent.
export type SelfExclusionResult = "LOCKED" | "CODE_REQUIRED";

const MFA_CODE_PENDING = "MFA_CODE_PENDING";
const MFA_CODE_FAILED = "MFA_CODE_FAILED";

export const isWrongCode = (error: unknown) =>
	error instanceof IPSErrors && error.status === MFA_CODE_FAILED;

// The backend locks the account and ends the current session on success, so the local session is cleared too.
// The lock can be extended later but never shortened, and only staff can lift it.
export const useSelfExclude = () => {
	const { sessionKey } = usePrimaryAccount();
	const logOut = useLogOut();
	return useMutation({
		mutationKey: ["self-exclude"],
		mutationFn: async ({
			lockPeriod,
			lockPeriodUnit,
			mfaCode,
		}: Props): Promise<SelfExclusionResult> => {
			const API = "/lockPlayer";
			try {
				await IPS_AXIOS_CLIENT.post(API, {
					sessionKey,
					lockType: "EXCLUSION",
					lockPeriod: String(lockPeriod),
					lockPeriodUnit,
					...(mfaCode && { mfaCode }),
				});
				return "LOCKED";
			} catch (e) {
				if (e instanceof IPSErrors && e.status === MFA_CODE_PENDING) {
					return "CODE_REQUIRED";
				}
				console.error("Error self-excluding player:", e);
				throw e;
			}
		},
		onSuccess: async (result, { lockedUntil }) => {
			if (result !== "LOCKED") {
				return;
			}
			notifications.show({
				title: "Your account is locked",
				message: `You are self-excluded until ${lockedUntil} and have been logged out.`,
				color: "brand",
				icon: <IconLock />,
				autoClose: false,
				withCloseButton: true,
			});
			await logOut();
		},
		onError: (error) => {
			if (isWrongCode(error)) {
				notifications.show({
					message: "The security code is incorrect or has expired",
					color: "danger",
				});
			} else {
				showErrorToast(error, "Couldn't self-exclude your account");
			}
		},
	});
};
