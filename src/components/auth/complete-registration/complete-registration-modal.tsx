import { Button, SimpleGrid, Stack, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { AddressFields } from "@/components/auth/components/address-fields.tsx";
import type { CompletionValues } from "@/components/auth/signup-model.ts";
import { DETAILS_VALIDATION } from "@/components/auth/signup-validation.ts";
import { PortalModal } from "@/components/route-modal";
import { usePromptOnce } from "@/hooks/use-prompt-once.ts";
import { useQuickSignupCompletion } from "@/server/IPS/signup/use-quick-signup-completion.tsx";
import { PortalTextInput } from "@/ui/form-inputs";
import classes from "./complete-registration.module.css";
import {
	completeRegistrationDialog,
	useIsCompleteRegistrationOpen,
} from "./complete-registration-store.ts";
import { useNeedsRegistration } from "./use-needs-registration.ts";

const DIALOG_WIDTH = 520;

const CompletionForm = () => {
	const { mutate, isPending } = useQuickSignupCompletion();
	const form = useForm<CompletionValues>({
		initialValues: {
			firstName: "",
			lastName: "",
			address: "",
			city: "",
			country: "",
			province: "",
			postalCode: "",
		},
		validate: DETAILS_VALIDATION,
	});

	const submit = form.onSubmit((values) => {
		mutate(values, { onSuccess: completeRegistrationDialog.close });
	});

	return (
		<form onSubmit={submit}>
			<Stack gap="sm">
				<SimpleGrid cols={2} spacing="xs">
					<PortalTextInput
						aria-label="First name"
						placeholder="First name"
						autoComplete="given-name"
						{...form.getInputProps("firstName")}
					/>
					<PortalTextInput
						aria-label="Last name"
						placeholder="Last name"
						autoComplete="family-name"
						{...form.getInputProps("lastName")}
					/>
				</SimpleGrid>
				<AddressFields
					address={form.getInputProps("address")}
					city={form.getInputProps("city")}
					country={form.getInputProps("country")}
					province={form.getInputProps("province")}
					postalCode={form.getInputProps("postalCode")}
				/>
				<Button type="submit" size="md" fullWidth loading={isPending}>
					Complete registration
				</Button>
				<Button
					variant="subtle"
					color="dark.1"
					onClick={completeRegistrationDialog.close}
				>
					Not now
				</Button>
			</Stack>
		</form>
	);
};

// "Complete your registration" for a QUICK_REG player: shown once after sign-in and
// whenever they try to play or pay. It never blocks the site; Not now closes it.
export function CompleteRegistrationModal() {
	const needsRegistration = useNeedsRegistration();
	const isOpen = useIsCompleteRegistrationOpen();
	// Shown once per sign-in; playing or paying still opens it.
	usePromptOnce(
		"registration",
		needsRegistration,
		completeRegistrationDialog.open,
	);

	return (
		<PortalModal
			opened={isOpen && needsRegistration}
			onClose={completeRegistrationDialog.close}
			size={DIALOG_WIDTH}
			title="Complete your registration"
		>
			<Text className={classes.lead}>
				A few more details and you can play and deposit. You can do this later,
				too.
			</Text>
			<CompletionForm />
		</PortalModal>
	);
}
