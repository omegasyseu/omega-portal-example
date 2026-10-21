import { Button, Flex, Modal, Stack, Text } from "@mantine/core";
import { IconMailCheck, IconShieldLock } from "@tabler/icons-react";
import { useState } from "react";
import { ResendCode } from "@/components/resend-code/resend-code.tsx";
import { PortalCodeInput } from "@/ui/form-inputs";
import classes from "./code-entry-modal.module.css";

// "merlin@omegasys.eu" → "m****n@omegasys.eu", so the modal shows where the code went without exposing it.
export const maskEmail = (email: string | undefined) => {
	if (!email?.includes("@")) {
		return undefined;
	}
	const [name, domain] = email.split("@");
	const visible =
		name.length <= 2
			? `${name[0]}*`
			: `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}`;
	return `${visible}@${domain}`;
};

export type ProfileChangeRow = {
	label: string;
	from: string;
	to: string;
};

type Props = {
	// Where the code was sent, already masked for display.
	sentTo?: string;
	changes: ProfileChangeRow[];
	close: () => void;
	onConfirm: (code: string) => void;
	onResend: (onSent: () => void) => void;
	confirming: boolean;
	resending: boolean;
	// What the confirm button says, such as "Lock my account"; "Confirm and save" by default.
	confirmLabel?: string;
};

// Step-up check before a profile change: the code goes to the player's CURRENT (previous) contact details and the
// change is only saved once it is confirmed. Styled to match the portal's dark modals.
const CodeEntryModal = ({
	sentTo,
	changes,
	close,
	onConfirm,
	onResend,
	confirming,
	resending,
	confirmLabel = "Confirm and save",
}: Props) => {
	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>(null);

	const handleConfirm = (event: React.FormEvent) => {
		event.preventDefault();
		if (code.length < 4) {
			setError("Please enter the code you received");
			return;
		}
		setError(null);
		onConfirm(code);
	};

	// A new code replaces the old one, so the field starts empty again.
	const handleResend = (onSent: () => void) => {
		onResend(() => {
			setCode("");
			setError(null);
			onSent();
		});
	};

	return (
		<Modal
			opened
			// Once the code is on its way the change can't be called back, so the modal
			// stays until the request settles.
			onClose={confirming ? () => undefined : close}
			withCloseButton={!confirming}
			closeOnEscape={!confirming}
			centered
			size="lg"
			radius="lg"
			closeOnClickOutside={false}
			overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
			classNames={{
				content: classes.content,
				header: classes.header,
				close: classes.close,
			}}
			title={
				<Flex align="center" gap="xs">
					<IconShieldLock
						size={22}
						color="var(--mantine-primary-color-filled)"
					/>
					<Text fw={700} size="lg" c="dark.0">
						Confirm it&#39;s you
					</Text>
				</Flex>
			}
		>
			<Stack gap="lg">
				<div className={classes.infoPanel}>
					<IconMailCheck size={20} className={classes.infoIcon} />
					<div>
						<div className={classes.infoTitle}>
							We&#39;ve sent you a security code
						</div>
						{sentTo ? (
							<>
								A code was sent to your current email address{" "}
								<Text span fw={600} c="dark.0">
									{sentTo}
								</Text>
								.
							</>
						) : (
							"A code was sent to your current contact details."
						)}{" "}
						Enter it below to approve the changes. Nothing is saved until the
						code is confirmed.
					</div>
				</div>

				{changes.length > 0 && (
					<div>
						<div className={classes.sectionLabel}>You are changing</div>
						<div className={classes.changes}>
							<div className={`${classes.changeRow} ${classes.changeHead}`}>
								<span>Field</span>
								<span>Current</span>
								<span>New</span>
							</div>
							{changes.map((row) => (
								<div key={row.label} className={classes.changeRow}>
									<span className={classes.changeField}>{row.label}</span>
									<span className={classes.changeFrom}>{row.from || "—"}</span>
									<span className={classes.changeTo}>{row.to}</span>
								</div>
							))}
						</div>
					</div>
				)}

				<form id="code-entry-form" onSubmit={handleConfirm}>
					<PortalCodeInput
						label="Security code"
						data-autofocus
						value={code}
						error={error}
						onChange={setCode}
					/>
				</form>

				<Button
					form="code-entry-form"
					type="submit"
					size="md"
					fullWidth
					loading={confirming}
					// A resend replaces the code, so confirming waits for it.
					disabled={resending}
				>
					{confirmLabel}
				</Button>

				<Stack gap={4} align="center">
					<ResendCode
						onResend={handleResend}
						isResending={resending}
						isDisabled={confirming}
					/>
					<Text className={classes.footer}>
						Check your spam or junk folder too.
					</Text>
				</Stack>
			</Stack>
		</Modal>
	);
};

export default CodeEntryModal;
