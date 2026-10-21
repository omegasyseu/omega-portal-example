import { Anchor, Button, Stack, Text } from "@mantine/core";
import { type UseFormReturnType, useForm } from "@mantine/form";
import { type FormEvent, useState } from "react";
import { CredentialStatus } from "@/components/auth/components/credential-status.tsx";
import { PasswordRules } from "@/components/auth/components/password-rules.tsx";
import {
	useAuthSearch,
	useGoToAuthStep,
} from "@/components/auth/hooks/use-auth-dialog.ts";
import { useCredentialCheck } from "@/components/auth/hooks/use-credential-check.ts";
import { usePasswordRules } from "@/components/auth/hooks/use-password-rules.ts";
import { useSignup } from "@/components/auth/hooks/use-signup.tsx";
import { useSignupConsents } from "@/components/auth/hooks/use-signup-consents.ts";
import {
	type PasswordRule,
	passwordError,
} from "@/components/auth/password-policy.ts";
import {
	consentedVersionsFor,
	type SignupValues,
	toSignupRequest,
} from "@/components/auth/signup-model.ts";
import {
	DETAILS_VALIDATION,
	validateBirthDate,
	validateConsent,
	validateEmail,
	validateMobile,
	validateTerms,
	validateUsername,
	validateVerifyWith,
} from "@/components/auth/signup-validation.ts";
import { useShownIpsBrand } from "@/components/brand/use-selected-brand.ts";
import { useShownBrandId } from "@/providers/brand-content/brand-content-provider.tsx";
import { isEnableQuickSignupLink } from "@/server/config";
import { PortalPasswordInput, PortalTextInput } from "@/ui/form-inputs";
import classes from "./signup.module.css";
import { SignupDetails } from "./signup-details.tsx";

type Props = {
	country: string;
	currency: string;
};

export type SignupForm = UseFormReturnType<SignupValues>;

const ACCOUNT_FIELDS = ["email", "password"] as const;

// The account step: email (checked with IPS as soon as the player leaves the field, as
// on Omega Wins) and password.
const AccountStep = ({
	form,
	isContinuing,
	emailCheck,
	passwordRules,
}: {
	form: SignupForm;
	isContinuing: boolean;
	emailCheck: ReturnType<typeof useCredentialCheck>;
	passwordRules: PasswordRule[];
}) => {
	const goToStep = useGoToAuthStep();
	const email = form.getInputProps("email");

	return (
		<Stack gap="sm">
			<Text className={classes.stepChip}>Step 1 of 2</Text>
			<PortalTextInput
				placeholder="Email"
				aria-label="Email"
				type="email"
				autoComplete="email"
				spellCheck={false}
				{...email}
				onChange={(event) => {
					email.onChange(event);
					emailCheck.reset();
				}}
				onBlur={(event) => {
					email.onBlur?.(event);
					const value = event.currentTarget.value;
					if (validateEmail(value) === null) {
						emailCheck.check(value);
					}
				}}
				error={email.error ?? emailCheck.error}
				rightSection={<CredentialStatus check={emailCheck} label="Email" />}
			/>
			<PortalPasswordInput
				placeholder="Password"
				aria-label="Password"
				autoComplete="new-password"
				{...form.getInputProps("password")}
			/>
			<PasswordRules
				rules={passwordRules}
				value={form.getValues().password}
				isRefused={Boolean(form.errors.password)}
			/>
			<Button type="submit" fullWidth size="md" loading={isContinuing}>
				Continue
			</Button>
			{isEnableQuickSignupLink() ? (
				<Text className={classes.switchLine}>
					In a hurry?{" "}
					<Anchor
						component="button"
						type="button"
						onClick={() => goToStep("quick-signup")}
					>
						Quick sign up
					</Anchor>
				</Text>
			) : null}
			<Text className={classes.switchLine}>
				Have an account?{" "}
				<Anchor
					component="button"
					type="button"
					onClick={() => goToStep("login")}
				>
					Sign in
				</Anchor>
			</Text>
		</Stack>
	);
};

// Full sign-up in two steps, as on Omega Wins: the account first, then the details the
// law asks for, sent together to /signup. The account opens in the Selected Brand.
const SignupForm = ({ country, currency }: Props) => {
	const [step, setStep] = useState<"account" | "details">("account");
	const [isContinuing, setIsContinuing] = useState(false);
	const { mutate, isPending } = useSignup();
	const consents = useSignupConsents();
	const brandId = useShownBrandId();
	const isSocialBrand = Boolean(useShownIpsBrand()?.isSocialBrand);
	const { referralCode } = useAuthSearch();

	const { consentList, isMarketingMandatory } = consents;

	const form = useForm<SignupValues>({
		initialValues: {
			email: "",
			password: "",
			firstName: "",
			lastName: "",
			username: "",
			birthMonth: "",
			birthDay: "",
			birthYear: "",
			address: "",
			city: "",
			country,
			province: "",
			postalCode: "",
			mobile: "",
			currency,
			secondaryCurrencies: "",
			verificationTarget: "email",
			// A numeric code arrives as a number (see searchValue); the form keeps text.
			referralCode: referralCode?.toString() ?? "",
			acceptTerms: false,
			acceptMarketing: false,
		},
		validate: {
			email: validateEmail,
			// The brand's rules, read when the form validates (see passwordRules below).
			password: (value) => passwordError(passwordRules, value),
			...DETAILS_VALIDATION,
			username: validateUsername,
			birthYear: validateBirthDate,
			mobile: validateMobile,
			currency: (value) =>
				isSocialBrand || value ? null : "Choose a currency",
			// Only a brand that plays in currencies has a second one, which differs from
			// the first.
			secondaryCurrencies: (value, values) =>
				!isSocialBrand && value && value === values.currency
					? "Choose a different currency"
					: null,
			verificationTarget: validateVerifyWith,
			acceptTerms: validateTerms,
			acceptMarketing: validateConsent(
				isMarketingMandatory,
				"Accept marketing to continue",
			),
		},
	});

	// The Selected Brand's password rules; "not your username" joins them once the
	// details step has one.
	const passwordRules = usePasswordRules(brandId, {
		username: form.getValues().username,
	});

	const emailCheck = useCredentialCheck("email", brandId);

	// The account step's fields, then the email with IPS, before the details.
	const continueToDetails = async () => {
		const hasErrors = ACCOUNT_FIELDS.map(
			(field) => form.validateField(field).hasError,
		).some(Boolean);
		if (hasErrors) return;
		setIsContinuing(true);
		try {
			const taken = await emailCheck.verify(form.getValues().email);
			if (taken) {
				form.setFieldError("email", taken);
				return;
			}
		} catch (error) {
			// The check is a courtesy: /signup still refuses a registered email.
			console.error("Error checking the email:", error);
		} finally {
			setIsContinuing(false);
		}
		setStep("details");
	};

	const submitAccount = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void continueToDetails();
	};

	const submit = form.onSubmit(
		(values) => {
			// Which consents are mandatory isn't known until they load.
			if (!consents.isLoaded) return;
			mutate(
				toSignupRequest(values, {
					brandId,
					isSocialBrand,
					consentedVersions: consentedVersionsFor(values, consentList),
				}),
			);
		},
		// The username chosen here can break the password's rules; the password is on the
		// account step, so back there to show which.
		(errors) => {
			if (errors.password) setStep("account");
		},
	);

	return (
		<form
			id="signup-form"
			noValidate
			// Enter on the account step continues; only the details step submits.
			onSubmit={step === "account" ? submitAccount : submit}
			className={classes.form}
		>
			{step === "account" ? (
				<AccountStep
					form={form}
					isContinuing={isContinuing}
					emailCheck={emailCheck}
					passwordRules={passwordRules}
				/>
			) : (
				<SignupDetails
					form={form}
					brandId={brandId}
					isSocialBrand={isSocialBrand}
					isSubmitting={isPending}
					consents={consents}
					// The form's own consent rules decide whether the boxes ticked are enough.
					hasAgreed={
						form.isValid("acceptTerms") && form.isValid("acceptMarketing")
					}
					onBack={() => setStep("account")}
				/>
			)}
		</form>
	);
};

export default SignupForm;
