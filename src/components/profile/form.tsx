import { Button, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { completeRegistrationDialog } from "@/components/auth/complete-registration/complete-registration-store.ts";
import { AddressFields } from "@/components/auth/components/address-fields.tsx";
import { BirthDateSelect } from "@/components/auth/components/birth-date-select.tsx";
import { GENDERS, LANGSFormated } from "@/components/auth/constants";
import { formatBirthDate } from "@/components/auth/signup-model.ts";
import CodeEntryModal, {
	maskEmail,
	type ProfileChangeRow,
} from "@/components/profile/code-entry-modal.tsx";
import { useEditProfileFormContext } from "@/components/profile/form-context.tsx";
import {
	type ProfileChange,
	useUpdatePlayerInfo,
} from "@/components/profile/hooks/use-update-player-info.tsx";
import { storedBirthDate } from "@/components/profile/stored-birth-date.ts";
import { useGetPlayerInfo } from "@/server/IPS/user/get-player-info.ts";
import { PortalSelect, PortalTextInput } from "@/ui/form-inputs";
import { PortalPhoneInput } from "@/ui/form-inputs/portal-phone-input";
import classes from "./profile-form.module.css";

// Compares phone numbers by digits only, so "+1 438 909 7890" and "+14389097890" count as the same number.
const digitsOf = (phone: string | null | undefined) =>
	(phone ?? "").replace(/\D/g, "");

const trimmed = (value: unknown) =>
	typeof value === "string" ? value.trim() : "";

// Fields the player cannot change here: shown with a dashed border (see profile-form.module.css).
const LOCKED = {
	disabled: true,
} as const;

const FIELD_LABELS: Record<keyof ProfileChange, string> = {
	firstName: "First name",
	lastName: "Last name",
	birthDate: "Date of birth",
	email: "Email",
	mobilePhone: "Mobile",
	phone: "Telephone",
	address: "Street name",
	streetNumber: "Street number",
	postalCode: "Postal code",
	city: "City",
	province: "Province",
	country: "Country",
	languageCode: "Language",
	gender: "Gender",
};

// The player-info field each change is compared with, for the "current" column of the confirmation modal.
const CURRENT_FIELD: Record<keyof ProfileChange, string> = {
	firstName: "firstName",
	lastName: "lastName",
	birthDate: "birthDate",
	email: "email",
	mobilePhone: "mobilePhone",
	phone: "phone",
	address: "address",
	streetNumber: "streetNumber",
	postalCode: "postalCode",
	city: "city",
	province: "province",
	country: "country",
	languageCode: "language",
	gender: "gender",
};

// The birth date the selects describe and the stored one, both as IPS reads them
// ("1988-06-22"), so they compare and read alike.
const birthDateOf = (values: {
	birthMonth?: string;
	birthDay?: string;
	birthYear?: string;
}) =>
	formatBirthDate({
		month: values.birthMonth ?? "",
		day: values.birthDay ?? "",
		year: values.birthYear ?? "",
	});

const storedBirthDateOf = (birthDateFormatted: string | null | undefined) =>
	formatBirthDate(storedBirthDate(birthDateFormatted)) ?? "";

const EditProfileFormView = () => {
	const { data: playerInfo } = useGetPlayerInfo();
	const form = useEditProfileFormContext();
	// Separate instances so "Resend Code" and "Confirm" show their own loading state.
	const updatePlayerInfo = useUpdatePlayerInfo();
	const confirmSave = useUpdatePlayerInfo();
	// The change waiting for its security code; the same fields are resent with mfaCode to commit it.
	const [pendingChange, setPendingChange] = useState<ProfileChange | null>(
		null,
	);

	const showSaved = () =>
		notifications.show({
			message: "Your details have been updated",
			color: "neon",
		});

	// Builds the request from the fields that differ from the saved profile. Empty fields are not sent, so a
	// cleared input never wipes a stored value. The username is read-only here.
	const buildChange = (values: typeof form.values): ProfileChange => {
		const current = (playerInfo ?? {}) as Record<string, unknown>;
		const change: ProfileChange = {};
		const birthDate = birthDateOf(values);
		if (
			birthDate &&
			birthDate !== storedBirthDateOf(playerInfo?.birthDateFormatted)
		) {
			change.birthDate = birthDate;
		}
		const email = trimmed(values.email);
		if (email && email.toLowerCase() !== trimmed(current.email).toLowerCase()) {
			change.email = email;
		}
		// A number counts once it has digits: a field cleared down to its "+" isn't sent.
		if (
			digitsOf(values.mobile) &&
			digitsOf(values.mobile) !== digitsOf(playerInfo?.mobilePhone)
		) {
			change.mobilePhone = values.mobile;
		}
		if (
			digitsOf(values.phone) &&
			digitsOf(values.phone) !== digitsOf(playerInfo?.phone)
		) {
			change.phone = values.phone;
		}
		for (const key of [
			"firstName",
			"lastName",
			"address",
			"streetNumber",
			"postalCode",
			"city",
			"province",
		] as const) {
			const value = trimmed(values[key]);
			if (value && value !== trimmed(current[key])) {
				change[key] = value;
			}
		}
		const country = trimmed(values.country).toUpperCase();
		if (country && country !== trimmed(current.country).toUpperCase()) {
			change.country = country;
		}
		if (values.langCode && values.langCode !== playerInfo?.language) {
			change.languageCode = values.langCode;
		}
		if (values.gender && values.gender !== playerInfo?.gender) {
			change.gender = values.gender;
		}
		return change;
	};

	// Authentication before the change: when the brand requires it (otp.player.components = UPDATE_PLAYER_INFO),
	// the first request saves nothing and sends a security code to the player's CURRENT (previous) contact
	// details; the change is committed only when the same fields are resent with that code as mfaCode.
	const handleSubmit = form.onSubmit((values) => {
		if (playerInfo?.registrationStatus === "QUICK_REG") {
			return;
		}
		const change = buildChange(values);
		if (Object.keys(change).length === 0) {
			return;
		}
		updatePlayerInfo.mutate(change, {
			onSuccess: (result) => {
				if (result === "CODE_REQUIRED") {
					setPendingChange(change);
				} else {
					showSaved();
				}
			},
		});
	});

	const handleConfirmCode = (mfaCode: string) => {
		if (!pendingChange) {
			return;
		}
		confirmSave.mutate(
			{ ...pendingChange, mfaCode },
			{
				onSuccess: (result) => {
					if (result === "SAVED") {
						setPendingChange(null);
						showSaved();
					}
				},
			},
		);
	};

	// Resending the same request without mfaCode makes the backend issue a new code to the current contact details.
	const handleResendCode = (onSent: () => void) => {
		if (!pendingChange) {
			return;
		}
		updatePlayerInfo.mutate(pendingChange, { onSuccess: () => onSent() });
	};

	const saving = updatePlayerInfo.isPending || confirmSave.isPending;
	const hasChanges = Object.keys(buildChange(form.values)).length > 0;

	const changeRows = (change: ProfileChange): ProfileChangeRow[] => {
		const current = (playerInfo ?? {}) as Record<string, unknown>;
		return (Object.keys(change) as Array<keyof ProfileChange>).map((key) => ({
			label: FIELD_LABELS[key],
			from:
				key === "birthDate"
					? storedBirthDateOf(playerInfo?.birthDateFormatted)
					: trimmed(current[CURRENT_FIELD[key]]),
			to: change[key] ?? "",
		}));
	};

	return (
		<>
			{/* Outside the profile form: React bubbles the modal's submit event through the portal. */}
			{pendingChange && (
				<CodeEntryModal
					sentTo={maskEmail(playerInfo?.email)}
					changes={changeRows(pendingChange)}
					close={() => setPendingChange(null)}
					onConfirm={handleConfirmCode}
					onResend={handleResendCode}
					confirming={confirmSave.isPending}
					resending={updatePlayerInfo.isPending}
				/>
			)}
			<form
				id={"edit-profile-form"}
				onSubmit={handleSubmit}
				className={classes.form}
			>
				<p className={classes.note}>
					Fields with a dashed border can&#39;t be changed here. Contact
					Customer Support to update them.
				</p>
				{/* The sign-in details first: players sign in with their username or email. */}
				<div className={classes.fields}>
					<PortalTextInput
						label={"Username"}
						name={"username"}
						{...form.getInputProps("username")}
						{...LOCKED}
					/>
					<PortalTextInput
						label={"Email"}
						name={"email"}
						type="email"
						autoComplete="email"
						spellCheck={false}
						{...form.getInputProps("email")}
					/>
					<PortalTextInput
						label={"First name"}
						name={"firstName"}
						autoComplete="given-name"
						{...form.getInputProps("firstName")}
					/>
					<PortalTextInput
						label={"Last name"}
						name={"lastName"}
						autoComplete="family-name"
						{...form.getInputProps("lastName")}
					/>
					{/* Asked for the way sign-up asks for it. */}
					<BirthDateSelect
						month={form.getInputProps("birthMonth")}
						day={form.getInputProps("birthDay")}
						year={form.getInputProps("birthYear")}
						error={form.errors.birthYear as string | undefined}
					/>
					<PortalSelect
						data={GENDERS}
						label={"Gender"}
						name={"gender"}
						{...form.getInputProps("gender")}
					/>
				</div>
				<AddressFields
					streetNumber={{
						name: "streetNumber",
						...form.getInputProps("streetNumber"),
					}}
					address={{ name: "address", ...form.getInputProps("address") }}
					city={{ name: "city", ...form.getInputProps("city") }}
					country={{ name: "country", ...form.getInputProps("country") }}
					province={{ name: "province", ...form.getInputProps("province") }}
					postalCode={{
						name: "postalCode",
						...form.getInputProps("postalCode"),
					}}
				/>
				<Title order={3} className={classes.section}>
					Contact
				</Title>
				<div className={classes.fields}>
					<PortalPhoneInput
						label={"Mobile"}
						{...form.getInputProps("mobile")}
					/>
					<PortalPhoneInput
						label={"Telephone"}
						{...form.getInputProps("phone")}
					/>
				</div>
				<Title order={3} className={classes.section}>
					Account
				</Title>
				{/* The account's currencies are set when it is opened, so they are not shown here. */}
				<div className={classes.fields}>
					<PortalSelect
						name={"langCode"}
						data={LANGSFormated}
						label={"Language"}
						{...form.getInputProps("langCode")}
					/>
				</div>
				<Title order={3} className={classes.section}>
					Additional details
				</Title>
				<div className={classes.fieldsThree}>
					<PortalTextInput
						name={"socialSecurityNumber"}
						label={"SSN"}
						{...LOCKED}
					/>
					<PortalTextInput
						name={"agentCode"}
						label={"Agent code"}
						{...LOCKED}
					/>
					<PortalTextInput
						name={"loyaltyId"}
						label={"Loyalty ID"}
						{...LOCKED}
					/>
				</div>
				<div className={classes.actions}>
					{playerInfo?.registrationStatus === "QUICK_REG" ? (
						// A quick sign-up adds their name and address in the completion dialog.
						<Button onClick={completeRegistrationDialog.open}>
							Complete Registration
						</Button>
					) : (
						<>
							<Button
								type={"submit"}
								form={"edit-profile-form"}
								loading={saving}
								disabled={!hasChanges}
							>
								Save changes
							</Button>
							{/* Only brands that require it send a code, so this says "may". */}
							<p className={classes.note}>
								We may ask for a security code we send you before saving.
							</p>
						</>
					)}
				</div>
			</form>
		</>
	);
};

export default EditProfileFormView;
