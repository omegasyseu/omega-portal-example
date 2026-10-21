import { Loader } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import type { useCredentialCheck } from "@/components/auth/hooks/use-credential-check.ts";
import classes from "./credential-status.module.css";

const CHECK_ICON_SIZE = 18;

// What a credential check shows inside its field: a spinner while IPS answers, then a
// tick once the email or mobile is free.
export function CredentialStatus({
	check,
	label,
}: {
	check: ReturnType<typeof useCredentialCheck>;
	label: string;
}) {
	if (check.isChecking) {
		return <Loader size="xs" aria-label={`Checking ${label.toLowerCase()}`} />;
	}
	if (check.isAvailable) {
		return (
			<IconCheck
				size={CHECK_ICON_SIZE}
				className={classes.available}
				role="img"
				aria-label={`${label} available`}
			/>
		);
	}
	return null;
}
