import { useState } from "react";
import CodeEntryModal, {
	maskEmail,
	type ProfileChangeRow,
} from "@/components/profile/code-entry-modal.tsx";
import { IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";
import {
	type LimitChange,
	useUpdateResponsibleGamingLimit,
} from "@/server/IPS/responsible-gaming/update-responsible-gaming-limit.tsx";
import { useGetPlayerInfo } from "@/server/IPS/user/get-player-info.ts";

const MFA_CODE_FAILED = "MFA_CODE_FAILED";

type SaveOptions = {
	onSaved?: () => void;
	onError?: (error: Error) => void;
};

// Authentication before a limit change: when the brand requires it (otp.player.components contains
// RESPONSIBLE_GAMING_LIMIT), the first request saves nothing and sends a security code; the change is committed
// only when the same request is resent with that code as mfaCode. Same flow as the profile update.
export const useLimitCodeStep = () => {
	// Separate instances so "Resend code" and "Confirm" show their own loading state.
	const update = useUpdateResponsibleGamingLimit();
	const confirm = useUpdateResponsibleGamingLimit();
	const [pending, setPending] = useState<{
		change: LimitChange;
		onSaved?: () => void;
		onError?: (error: Error) => void;
	} | null>(null);

	const save = (change: LimitChange, { onSaved, onError }: SaveOptions = {}) =>
		update.mutate(change, {
			onSuccess: (result) => {
				if (result === "CODE_REQUIRED") {
					setPending({ change, onSaved, onError });
				} else {
					onSaved?.();
				}
			},
			onError,
		});

	const confirmCode = (mfaCode: string) => {
		if (!pending) {
			return;
		}
		confirm.mutate(
			{ ...pending.change, mfaCode },
			{
				onSuccess: (result) => {
					if (result === "SAVED") {
						setPending(null);
						pending.onSaved?.();
					}
				},
				// A wrong code keeps the modal open for another try. Any other failure came after the code was
				// accepted (e.g. the service rejected the limit), so retrying the same code cannot succeed.
				onError: (error) => {
					if (
						!(error instanceof IPSErrors && error.status === MFA_CODE_FAILED)
					) {
						setPending(null);
						// e.g. the amount became invalid since the code was sent: the form shows it inline
						pending.onError?.(error);
					}
				},
			},
		);
	};

	// Resending the same request without mfaCode makes the backend issue a new code.
	const resendCode = (onSent: () => void) => {
		if (!pending) {
			return;
		}
		update.mutate(pending.change, { onSuccess: () => onSent() });
	};

	return {
		save,
		update,
		pendingChange: pending?.change ?? null,
		cancel: () => setPending(null),
		confirmCode,
		resendCode,
		confirming: confirm.isPending,
		resending: update.isPending,
	};
};

type ModalProps = {
	step: ReturnType<typeof useLimitCodeStep>;
	// The "you are changing" row for the pending change
	describe: (change: LimitChange) => ProfileChangeRow;
};

// Shown only while a change waits for its security code.
export const LimitCodeModal = ({ step, describe }: ModalProps) => {
	const { data: playerInfo } = useGetPlayerInfo();
	if (!step.pendingChange) {
		return null;
	}
	return (
		<CodeEntryModal
			sentTo={maskEmail(playerInfo?.email)}
			changes={[describe(step.pendingChange)]}
			close={step.cancel}
			onConfirm={step.confirmCode}
			onResend={step.resendCode}
			confirming={step.confirming}
			resending={step.resending}
		/>
	);
};
