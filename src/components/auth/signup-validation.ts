import { hasLength, isEmail, isNotEmpty } from "@mantine/form";
import {
	ADULT_AGE,
	type BirthDateParts,
	birthDateFrom,
	isAdult,
} from "@/components/auth/signup-model.ts";

// Field rules shared by sign-up, quick sign-up and completing a quick sign-up.

const USERNAME_MIN = 6;
const USERNAME_MAX = 100;
const EMAIL_MAX = 50;
const NAME_MIN = 2;
const MOBILE_MIN = 6;
const MOBILE_MAX = 20;

const isValidEmail = isEmail("Enter a valid email");
export const validateEmail = (value: string) =>
	value.length > EMAIL_MAX
		? `Use at most ${EMAIL_MAX} characters`
		: isValidEmail(value);
export const validateUsername = hasLength(
	{ min: USERNAME_MIN, max: USERNAME_MAX },
	`Use ${USERNAME_MIN}–${USERNAME_MAX} characters`,
);
export const validateMobile = hasLength(
	{ min: MOBILE_MIN, max: MOBILE_MAX },
	"Enter your mobile number",
);
export const validateVerifyWith = isNotEmpty("Choose how to verify");
export const required = (label: string) =>
	hasLength({ min: NAME_MIN }, `Enter your ${label}`);

// A name changed on the profile: an empty one isn't sent, and IPS keeps at most 20
// characters.
const PROFILE_NAME_MAX = 20;
const isProfileNameLength = hasLength(
	{ min: NAME_MIN, max: PROFILE_NAME_MAX },
	`Use ${NAME_MIN}–${PROFILE_NAME_MAX} characters`,
);
export const validateProfileName = (value: string | undefined) =>
	value?.trim() ? isProfileNameLength(value.trim()) : null;
export const validateCountry = isNotEmpty("Choose your country");

// The name and address rules, the same in sign-up and in completing a quick sign-up.
export const DETAILS_VALIDATION = {
	firstName: required("first name"),
	lastName: required("last name"),
	address: required("address"),
	city: required("city"),
	country: validateCountry,
	province: required("province"),
	postalCode: required("postal code"),
};

// Checked on the year select, so the message sits under all three.
export const validateBirthDate = (
	_: string,
	values: { birthMonth: string; birthDay: string; birthYear: string },
) => {
	const parts: BirthDateParts = {
		month: values.birthMonth,
		day: values.birthDay,
		year: values.birthYear,
	};
	const date = birthDateFrom(parts);
	if (!date) return "Choose your full date of birth";
	return isAdult(date, new Date()) ? null : `You must be ${ADULT_AGE} or older`;
};

// The terms must be ticked to sign up, whichever consents the brand has set up.
export const validateTerms = (value: boolean) =>
	value ? null : "Accept the terms to continue";

// A consent that must be ticked, when the brand makes it mandatory.
export const validateConsent =
	(isMandatory: boolean | undefined, message: string) => (value: boolean) =>
		isMandatory && !value ? message : null;
