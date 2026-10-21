import {
	Badge,
	Button,
	Center,
	Group,
	Loader,
	type MantineColor,
	Text,
} from "@mantine/core";
import { IconLock, IconShieldCheck, IconUser } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { formatedCountries } from "@/components/auth/constants";
import {
	validateBirthDate,
	validateProfileName,
} from "@/components/auth/signup-validation.ts";
import { type KycState, kycState } from "@/components/kyc/kyc-state.ts";
import UpdatePasswordForm from "@/components/profile/change-password/change-password-form.tsx";
import EditProfileFormView from "@/components/profile/form.tsx";
import {
	EditProfileFormProvider,
	useEditProfileForm,
} from "@/components/profile/form-context.tsx";
import {
	KycModal,
	useKycCheck,
} from "@/components/profile/general-info/kyc-verification.tsx";
import { PrivacyCard } from "@/components/profile/general-info/privacy-card.tsx";
import { ProfileCard } from "@/components/profile/general-info/profile-card.tsx";
import { storedBirthDate } from "@/components/profile/stored-birth-date.ts";
import { NEUTRAL_BADGE_COLOR } from "@/constants/badge-colours.ts";
import { useGetPlayerInfo } from "@/server/IPS/user/get-player-info.ts";
import classes from "./general-info.module.css";

// The existing personal details form, filled from the player's profile once it loads.
const PERSONAL_INFO_LOADING_HEIGHT = 320;

const isUnchanged = (
	value: string | undefined,
	stored: string | null | undefined,
) => (value ?? "").trim() === (stored ?? "").trim();

const PersonalInfoCard = () => {
	const { data, isError } = useGetPlayerInfo();
	const form = useEditProfileForm({
		// Only what the player changes is checked (and sent), so details stored elsewhere
		// that these rules would refuse never block a save.
		validate: {
			firstName: (value) =>
				isUnchanged(value, data?.firstName) ? null : validateProfileName(value),
			lastName: (value) =>
				isUnchanged(value, data?.lastName) ? null : validateProfileName(value),
			birthYear: (value, values) => {
				const stored = storedBirthDate(data?.birthDateFormatted);
				const parts = {
					birthMonth: values.birthMonth ?? "",
					birthDay: values.birthDay ?? "",
					birthYear: value ?? "",
				};
				const isUnchangedDate =
					parts.birthMonth === stored.month &&
					parts.birthDay === stored.day &&
					parts.birthYear === stored.year;
				return isUnchangedDate ? null : validateBirthDate(value ?? "", parts);
			},
		},
	});

	// Mantine's form.initialize only applies the first time, so later refetches never
	// touch unsaved edits; GeneralInfo remounts this card when registration completes.
	// biome-ignore lint/correctness/useExhaustiveDependencies: initialise the form only when data loads
	useEffect(() => {
		if (data) {
			const birthDate = storedBirthDate(data.birthDateFormatted);
			form.initialize({
				birthMonth: birthDate.month,
				birthDay: birthDate.day,
				birthYear: birthDate.year,
				firstName: data?.firstName,
				lastName: data?.lastName,
				email: data?.email,
				// The username a player signs in with is their IPS userId; nickname is a
				// separate, optional display name.
				username: data?.userId,
				gender: data?.gender,
				langCode: data?.language,
				postalCode: data?.postalCode,
				streetNumber: data?.streetNumber,
				address: data?.address,
				city: data?.city,
				province: data?.province,
				country: formatedCountries.find(
					(c) => c.value === data?.country?.toLowerCase(),
				)?.value,
				mobile: data?.mobilePhone,
				phone: data?.phone,
			});
		}
	}, [data]);

	return (
		<ProfileCard
			id="personal-info"
			icon={IconUser}
			title="Personal info"
			className={classes.personal}
		>
			{/* The fields mount once they hold the player's details: the phone inputs
			    report their own value when they mount, which would replace a stored
			    number that arrived later. */}
			{form.initialized ? (
				<EditProfileFormProvider form={form}>
					<EditProfileFormView />
				</EditProfileFormProvider>
			) : isError ? (
				<Text className={classes.hint}>
					We couldn&#39;t load your details. Refresh the page to try again.
				</Text>
			) : (
				<Center mih={PERSONAL_INFO_LOADING_HEIGHT}>
					<Loader aria-label="Loading your details" />
				</Center>
			)}
		</ProfileCard>
	);
};

// The badge and hint for each KYC State, and whether the provider check is offered (while
// the player has something to do). Account problems show none of them.
const KYC_STATE_DISPLAY: Record<
	KycState,
	{ label: string; color: MantineColor; hint: string; canStart: boolean }
> = {
	verified: {
		label: "Verified",
		color: "neon",
		hint: "Your identity is verified. Upload new documents if your details change.",
		canStart: false,
	},
	actionNeeded: {
		label: "Action needed",
		color: "gold",
		hint: "We need to verify your identity. Verify it with our provider, or upload your documents in the Kyc tab.",
		canStart: true,
	},
	underReview: {
		label: "Under review",
		color: NEUTRAL_BADGE_COLOR,
		hint: "We're checking your identity. There's nothing you need to do for now.",
		canStart: false,
	},
	notVerified: {
		label: "Not verified",
		color: NEUTRAL_BADGE_COLOR,
		hint: "Verify your identity with our provider, or see and upload your documents in the Kyc tab.",
		canStart: true,
	},
};

const KycCard = () => {
	const { data, isError } = useGetPlayerInfo();
	const state = data ? kycState(data.kycStatus) : null;
	const display = state ? KYC_STATE_DISPLAY[state] : null;
	const { kycRedirectUrl, isLoadingKyc, handleKycClick, handleKycModalClose } =
		useKycCheck();

	return (
		<ProfileCard
			id="kyc-status"
			icon={IconShieldCheck}
			title="KYC"
			className={classes.kyc}
			aside={
				display ? (
					<Badge variant="outline" color={display.color} size="lg">
						{display.label}
					</Badge>
				) : null
			}
		>
			{display ? <Text className={classes.hint}>{display.hint}</Text> : null}
			<Group gap="sm">
				{display?.canStart || isError ? (
					<Button
						variant="default"
						loading={isLoadingKyc}
						onClick={handleKycClick}
					>
						Verify my identity
					</Button>
				) : null}
				<Button component={Link} to="/upload-documents" variant="default">
					Open the Kyc tab
				</Button>
			</Group>
			<KycModal url={kycRedirectUrl} onClose={handleKycModalClose} />
		</ProfileCard>
	);
};

const ChangePasswordCard = () => (
	<ProfileCard
		id="change-password"
		icon={IconLock}
		title="Change password"
		className={classes.password}
	>
		<UpdatePasswordForm />
	</ProfileCard>
);

// General info: the personal details form beside the KYC, privacy and password cards
// (approved mockup).
export function GeneralInfo() {
	const { data } = useGetPlayerInfo();
	return (
		<div className={classes.layout}>
			{/* A fresh form once a quick sign-up adds its name and address. */}
			<PersonalInfoCard key={data?.registrationStatus} />
			<div className={classes.side}>
				<KycCard />
				<PrivacyCard />
				<ChangePasswordCard />
			</div>
		</div>
	);
}
