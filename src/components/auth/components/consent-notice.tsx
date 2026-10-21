import { Anchor, Text } from "@mantine/core";
import type { SignupConsents } from "@/components/auth/hooks/use-signup-consents.ts";
import classes from "./consent-notice.module.css";

// Why the sign-up button is off: the terms couldn't load (with a way to try again), or
// the required boxes aren't ticked yet. The button names this line with
// aria-describedby.
export function ConsentNotice({
	id,
	consents,
	hasAgreed,
}: {
	id: string;
	consents: SignupConsents;
	hasAgreed: boolean;
}) {
	if (consents.hasFailed) {
		return (
			<Text id={id} className={classes.notice} role="alert">
				We couldn&#39;t load the terms.{" "}
				<Anchor
					component="button"
					type="button"
					onClick={consents.retry}
					disabled={consents.isRetrying}
				>
					Try again
				</Anchor>
			</Text>
		);
	}
	if (consents.isLoaded && !hasAgreed) {
		return (
			<Text id={id} className={classes.notice}>
				Agree to the terms to continue.
			</Text>
		);
	}
	return null;
}
