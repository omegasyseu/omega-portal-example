import { Anchor, Button, Checkbox, Stack, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { BirthDateSelect } from "@/components/auth/components/birth-date-select.tsx";
import {
	Marketing,
	TermsAndCondition,
} from "@/components/auth/components/checkboxes/terms-marketing.tsx";
import { ConsentNotice } from "@/components/auth/components/consent-notice.tsx";
import { CredentialStatus } from "@/components/auth/components/credential-status.tsx";
import { PasswordRules } from "@/components/auth/components/password-rules.tsx";
import {
	useAuthSearch,
	useGoToAuthStep,
} from "@/components/auth/hooks/use-auth-dialog.ts";
import { useCredentialCheck } from "@/components/auth/hooks/use-credential-check.ts";
import { usePasswordRules } from "@/components/auth/hooks/use-password-rules.ts";
import { useQuickSignupStepOne } from "@/components/auth/hooks/use-quick-signup-step-one.tsx";
import { useSignupConsents } from "@/components/auth/hooks/use-signup-consents.ts";
import { passwordError } from "@/components/auth/password-policy.ts";
import {
	consentedVersionsFor,
	mobileForIps,
	type QuickSignupValues,
	toQuickSignupRequest,
	VERIFY_WITH,
} from "@/components/auth/signup-model.ts";
import {
	validateBirthDate,
	validateConsent,
	validateEmail,
	validateMobile,
	validateTerms,
	validateUsername,
	validateVerifyWith,
} from "@/components/auth/signup-validation.ts";
import { useShownBrandId } from "@/providers/brand-content/brand-content-provider.tsx";
import {
	PortalPasswordInput,
	PortalSelect,
	PortalTextInput,
} from "@/ui/form-inputs";
import { PortalPhoneInput } from "@/ui/form-inputs/portal-phone-input";
import classes from "./signup.module.css";

// Quick sign-up (QUICK_REG) on one page: enough to verify and play, with the name and
// address asked for later, before the first game or deposit, in the Selected Brand.
// Email and mobile are checked with IPS as soon as the player leaves them.
const CONSENT_NOTICE_ID = "quick-signup-consent-notice";

const QuickSignupForm = () => {
	const consents = useSignupConsents();
	const brandId = useShownBrandId();
	const { mutate, isPending } = useQuickSignupStepOne();
	const goToStep = useGoToAuthStep();
	const { referralCode } = useAuthSearch();

	const { consentList, isMarketingMandatory } = consents;

	const form = useForm<QuickSignupValues>({
		initialValues: {
			username: "",
			email: "",
			mobile: "",
			password: "",
			birthMonth: "",
			birthDay: "",
			birthYear: "",
			verificationTarget: "email",
			// A numeric code arrives as a number (see searchValue); the form keeps text.
			referralCode: referralCode?.toString() ?? "",
			acceptTerms: false,
			acceptMarketing: false,
		},
		validate: {
			username: validateUsername,
			email: validateEmail,
			mobile: validateMobile,
			// The brand's rules, read when the form validates (see passwordRules below).
			password: (value) => passwordError(passwordRules, value),
			birthYear: validateBirthDate,
			verificationTarget: validateVerifyWith,
			acceptTerms: validateTerms,
			acceptMarketing: validateConsent(
				isMarketingMandatory,
				"Accept marketing to continue",
			),
		},
	});

	const { username } = form.getValues();
	const passwordRules = usePasswordRules(brandId, { username });
	const emailCheck = useCredentialCheck("email", brandId);
	const mobileCheck = useCredentialCheck("mobilePhone", brandId);
	const email = form.getInputProps("email");
	const mobile = form.getInputProps("mobile");

	// The form's own consent rules decide whether the boxes ticked are enough.
	const hasAgreed =
		form.isValid("acceptTerms") && form.isValid("acceptMarketing");
	const canSignUp = consents.isLoaded && hasAgreed;

	// A check that fails is a courtesy lost: /quickSignup still refuses a taken
	// email or mobile.
	const verifyOrSkip = (verify: Promise<string | null>, label: string) =>
		verify.catch((error: unknown) => {
			console.error(`Error checking the ${label}:`, error);
			return null;
		});

	// The checks run again here in case the player submits straight from a field.
	const submit = form.onSubmit(async (values) => {
		// Which consents are mandatory isn't known until they load.
		if (!consents.isLoaded) return;
		const [emailTaken, mobileTaken] = await Promise.all([
			verifyOrSkip(emailCheck.verify(values.email), "email"),
			verifyOrSkip(mobileCheck.verify(mobileForIps(values.mobile)), "mobile"),
		]);
		if (emailTaken) form.setFieldError("email", emailTaken);
		if (mobileTaken) form.setFieldError("mobile", mobileTaken);
		if (emailTaken || mobileTaken) return;
		mutate(
			toQuickSignupRequest(values, {
				brandId,
				consentedVersions: consentedVersionsFor(values, consentList),
			}),
		);
	});

	return (
		<form
			id="quick-signup-form"
			noValidate
			onSubmit={submit}
			className={classes.form}
		>
			<Stack gap="sm">
				<Text className={classes.stepLead}>
					Sign up now and add your name and address later. We&#39;ll ask for
					them before you play or deposit.
				</Text>
				<PortalTextInput
					placeholder="Username (at least 6 characters)"
					aria-label="Username"
					autoComplete="username"
					spellCheck={false}
					{...form.getInputProps("username")}
				/>
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
						if (validateEmail(value) === null) emailCheck.check(value);
					}}
					error={email.error ?? emailCheck.error}
					rightSection={<CredentialStatus check={emailCheck} label="Email" />}
				/>
				<PortalPhoneInput
					label="Mobile"
					{...mobile}
					onChange={(value) => {
						mobile.onChange(value);
						mobileCheck.reset();
					}}
					onBlur={(event) => {
						mobile.onBlur?.(event);
						const value = form.getValues().mobile;
						if (validateMobile(value) === null) {
							mobileCheck.check(mobileForIps(value));
						}
					}}
					error={mobile.error ?? mobileCheck.error ?? undefined}
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
				<BirthDateSelect
					month={form.getInputProps("birthMonth")}
					day={form.getInputProps("birthDay")}
					year={form.getInputProps("birthYear")}
					error={form.errors.birthYear as string | undefined}
				/>
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
					// The credential checks run before the request, so both count.
					loading={form.submitting || isPending}
					// Off until the consents have loaded and the mandatory ones are ticked
					// (and the Selected Brand is known).
					disabled={!canSignUp}
					aria-describedby={canSignUp ? undefined : CONSENT_NOTICE_ID}
				>
					Sign up
				</Button>
				<ConsentNotice
					id={CONSENT_NOTICE_ID}
					consents={consents}
					hasAgreed={hasAgreed}
				/>
				<Text className={classes.switchLine}>
					Prefer to do it all now?{" "}
					<Anchor
						component="button"
						type="button"
						onClick={() => goToStep("signup")}
					>
						Full sign up
					</Anchor>
				</Text>
			</Stack>
		</form>
	);
};

export default QuickSignupForm;
