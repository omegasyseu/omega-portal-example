import {
	Button,
	Checkbox,
	Group,
	SimpleGrid,
	Stack,
	Text,
} from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import { AddressFields } from "@/components/auth/components/address-fields.tsx";
import { BirthDateSelect } from "@/components/auth/components/birth-date-select.tsx";
import {
	Marketing,
	TermsAndCondition,
} from "@/components/auth/components/checkboxes/terms-marketing.tsx";
import { ConsentNotice } from "@/components/auth/components/consent-notice.tsx";
import type { SignupConsents } from "@/components/auth/hooks/use-signup-consents.ts";
import { VERIFY_WITH } from "@/components/auth/signup-model.ts";
import { useGetCurrenciesByBrand } from "@/server/IPS/general/get-all-currencies.ts";
import { PortalSelect, PortalTextInput } from "@/ui/form-inputs";
import { PortalPhoneInput } from "@/ui/form-inputs/portal-phone-input";
import classes from "./signup.module.css";
import type { SignupForm } from "./signup.tsx";

const CONSENT_NOTICE_ID = "signup-consent-notice";

type Props = {
	form: SignupForm;
	// The Selected Brand, which the account opens in.
	brandId: string | undefined;
	isSocialBrand: boolean;
	isSubmitting: boolean;
	consents: SignupConsents;
	// Whether the mandatory consents are ticked.
	hasAgreed: boolean;
	onBack: () => void;
};

// Sign-up's second step, laid out like Omega Wins' "Registration": the details the law
// asks for, then the portal's own account choices (currency, verification, referral)
// and the consents.
export function SignupDetails({
	form,
	brandId,
	isSocialBrand,
	isSubmitting,
	consents,
	hasAgreed,
	onBack,
}: Props) {
	const { country } = form.getValues();
	const canCreateAccount = consents.isLoaded && hasAgreed;
	const { data: currencies } = useGetCurrenciesByBrand({ brandId });

	return (
		<Stack gap="sm">
			<Group gap="xs">
				<Button
					variant="default"
					size="compact-md"
					leftSection={<IconChevronLeft size={16} aria-hidden />}
					onClick={onBack}
				>
					Go Back
				</Button>
				<Text className={classes.stepChip}>Step 2 of 2</Text>
			</Group>
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
			<PortalTextInput
				aria-label="Username"
				placeholder="Username (at least 6 characters)"
				autoComplete="username"
				spellCheck={false}
				{...form.getInputProps("username")}
			/>
			<BirthDateSelect
				month={form.getInputProps("birthMonth")}
				day={form.getInputProps("birthDay")}
				year={form.getInputProps("birthYear")}
				error={form.errors.birthYear as string | undefined}
			/>

			<AddressFields
				address={form.getInputProps("address")}
				city={form.getInputProps("city")}
				country={form.getInputProps("country")}
				province={form.getInputProps("province")}
				postalCode={form.getInputProps("postalCode")}
			/>
			<PortalPhoneInput
				label="Mobile"
				defaultCountryInfo={country}
				{...form.getInputProps("mobile")}
			/>

			<Text className={classes.sectionLabel}>Account</Text>
			{/* Social brands play in coins, so they choose no currency. */}
			{isSocialBrand ? null : (
				<SimpleGrid cols={2} spacing="xs">
					<PortalSelect
						label="Currency"
						searchable
						allowDeselect={false}
						data={currencies ?? []}
						{...form.getInputProps("currency")}
					/>
					<PortalSelect
						label="Secondary currency"
						placeholder="Optional"
						searchable
						data={currencies ?? []}
						{...form.getInputProps("secondaryCurrencies")}
					/>
				</SimpleGrid>
			)}
			<PortalSelect
				label="Verify with"
				allowDeselect={false}
				data={VERIFY_WITH}
				{...form.getInputProps("verificationTarget")}
			/>
			<PortalTextInput
				placeholder="Referral code (optional)"
				aria-label="Referral code"
				{...form.getInputProps("referralCode")}
			/>

			<Checkbox
				label={<TermsAndCondition />}
				{...form.getInputProps("acceptTerms", { type: "checkbox" })}
			/>
			<Checkbox
				label={<Marketing />}
				{...form.getInputProps("acceptMarketing", { type: "checkbox" })}
			/>
			<Button
				type="submit"
				size="md"
				fullWidth
				loading={isSubmitting}
				// Off until the consents have loaded and the mandatory ones are ticked.
				disabled={!canCreateAccount}
				aria-describedby={canCreateAccount ? undefined : CONSENT_NOTICE_ID}
			>
				Create account
			</Button>
			<ConsentNotice
				id={CONSENT_NOTICE_ID}
				consents={consents}
				hasAgreed={hasAgreed}
			/>
		</Stack>
	);
}
