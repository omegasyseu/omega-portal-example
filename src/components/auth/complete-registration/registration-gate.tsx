import { Center, Loader } from "@mantine/core";
import type { ReactNode } from "react";
import { RegistrationReminder } from "./registration-reminder.tsx";
import { useRegistrationState } from "./use-needs-registration.ts";

const CHECKING_MIN_HEIGHT = 240;

// A page a QUICK_REG player can't use yet (playing, paying): the reminder in its place,
// and nothing until their status is known, so the page never shows first.
export function RegistrationGate({
	action,
	children,
}: {
	action: string;
	children: ReactNode;
}) {
	const state = useRegistrationState();
	if (state === "checking") {
		return (
			<Center mih={CHECKING_MIN_HEIGHT}>
				<Loader aria-label="Loading" />
			</Center>
		);
	}
	if (state === "needed") return <RegistrationReminder action={action} />;
	return children;
}
