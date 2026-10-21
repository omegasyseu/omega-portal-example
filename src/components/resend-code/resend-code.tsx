import { Button, Text } from "@mantine/core";
import classes from "./resend-code.module.css";
import { resendLabel, useResendCooldown } from "./resend-cooldown";

type Props = {
	// Sends a new code; calls `onSent` once it has gone out, which starts a new wait.
	onResend: (onSent: () => void) => void;
	isResending: boolean;
	// Held off while something else is in flight, such as confirming the code.
	isDisabled?: boolean;
};

// Under any step that sent a code, as on Omega Wins: the offer to send another only
// opens 30 seconds after the last one went out.
export function ResendCode({ onResend, isResending, isDisabled }: Props) {
	const { secondsLeft, isWaiting, restart } = useResendCooldown();

	return (
		<Text className={classes.prompt}>
			Didn&#39;t receive the code?{" "}
			<Button
				variant="subtle"
				size="compact-sm"
				className={classes.action}
				loading={isResending}
				disabled={isWaiting || isDisabled}
				onClick={() => onResend(restart)}
			>
				{resendLabel(secondsLeft)}
			</Button>
		</Text>
	);
}
