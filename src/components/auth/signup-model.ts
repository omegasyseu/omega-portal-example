import dayjs from "dayjs";

// Sign-up's rules, kept free of React: the date-of-birth selects, reading IPS's credential
// check, and the requests sent to /signup and /quickSignupCompletion.

export const ADULT_AGE = 18;

// Any leap year: before the year is chosen, 29 February stays possible.
const LEAP_YEAR = 2000;

export const VERIFY_WITH = [
	{ value: "email", label: "Email" },
	{ value: "mobile", label: "Phone" },
];

const OLDEST_BIRTH_YEAR = 1900;

// Every birth year a player can choose, newest first. Years too recent for an adult stay
// in the list; the date's own check refuses them.
export const birthYears = (today: Date) => {
	const latest = today.getFullYear();
	return Array.from({ length: latest - OLDEST_BIRTH_YEAR + 1 }, (_, index) =>
		String(latest - index),
	);
};

// The year someone turning 18 this year was born, where the year list opens.
export const adultBirthYear = (today: Date) =>
	String(today.getFullYear() - ADULT_AGE);

export const daysInMonth = (
	month: number | undefined,
	year: number | undefined,
) => {
	if (!month) return 31;
	return dayjs(new Date(year ?? LEAP_YEAR, month - 1, 1)).daysInMonth();
};

export type BirthDateParts = { month: string; day: string; year: string };

// The date the three selects describe, or undefined while one is empty or the day
// doesn't exist in that month.
export const birthDateFrom = ({
	month,
	day,
	year,
}: BirthDateParts): Date | undefined => {
	const [m, d, y] = [Number(month), Number(day), Number(year)];
	if (!m || !d || !y || d > daysInMonth(m, y)) return undefined;
	return new Date(y, m - 1, d);
};

const NO_BIRTH_DATE: BirthDateParts = { month: "", day: "", year: "" };

// The three selects' values for a stored date (the profile shows it the way sign-up
// asks for it), empty when there's no valid date.
export const birthDatePartsOf = (date: Date | undefined): BirthDateParts =>
	date && !Number.isNaN(date.getTime())
		? {
				month: String(date.getMonth() + 1),
				day: String(date.getDate()),
				year: String(date.getFullYear()),
			}
		: NO_BIRTH_DATE;

export const isAdult = (birthDate: Date, today: Date) =>
	!dayjs(birthDate).add(ADULT_AGE, "year").isAfter(dayjs(today), "day");

export type CredentialCheck = {
	status?: string;
	exists?: string;
	fieldExist?: boolean;
};

export const isCredentialTaken = (response: CredentialCheck) =>
	response.fieldExist === true || response.exists === "true";

// IPS takes a mobile number without its leading "+".
export const mobileForIps = (mobile: string) => mobile.replace("+", "");

type Consent = {
	key?: string;
	consentVersionId?: number;
	isMandatory?: boolean;
};

const TERMS_CONSENT = "MANDATORY";
const MARKETING_CONSENT = "MARKETING";

// Whether the marketing box must be ticked, which only the brand decides. The terms are
// always required (validateTerms).
export const mandatoryConsents = (
	consents: readonly (Consent | undefined)[],
) => ({
	isMarketingMandatory: consents.some(
		(consent) => consent?.key === MARKETING_CONSENT && consent.isMandatory,
	),
});

// The consent versions behind the ticked boxes, as IPS takes them ("77,9").
export const consentedVersionsFor = (
	{
		acceptTerms,
		acceptMarketing,
	}: { acceptTerms: boolean; acceptMarketing: boolean },
	consents: readonly (Consent | undefined)[],
) => {
	const versionOf = (key: string) =>
		consents.find((consent) => consent?.key === key)?.consentVersionId;
	const versions = [
		acceptTerms ? versionOf(TERMS_CONSENT) : undefined,
		acceptMarketing ? versionOf(MARKETING_CONSENT) : undefined,
	].filter((version) => version !== undefined);
	return versions.length > 0 ? versions.join(",") : undefined;
};

const withoutEmpty = (values: Record<string, string | undefined>) =>
	Object.fromEntries(
		Object.entries(values).filter(
			([, value]) => value !== undefined && value !== "",
		),
	);

export type SignupValues = {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	username: string;
	birthMonth: string;
	birthDay: string;
	birthYear: string;
	address: string;
	city: string;
	country: string;
	province: string;
	postalCode: string;
	mobile: string;
	currency: string;
	secondaryCurrencies: string;
	verificationTarget: string;
	referralCode: string;
	acceptTerms: boolean;
	acceptMarketing: boolean;
};

// The date as IPS reads it ("1988-06-01"), or undefined while a select is empty.
export const formatBirthDate = (values: BirthDateParts) => {
	const date = birthDateFrom(values);
	return date ? dayjs(date).format("YYYY-MM-DD") : undefined;
};

// The /signup body, opening the account in the Selected Brand. Social brands play in
// coins, so they send no currency.
export const toSignupRequest = (
	values: SignupValues,
	{
		brandId,
		isSocialBrand,
		consentedVersions,
	}: {
		brandId: string | undefined;
		isSocialBrand: boolean;
		consentedVersions: string | undefined;
	},
) =>
	withoutEmpty({
		brandId,
		email: values.email,
		password: values.password,
		firstName: values.firstName,
		lastName: values.lastName,
		username: values.username,
		birthDate: formatBirthDate({
			month: values.birthMonth,
			day: values.birthDay,
			year: values.birthYear,
		}),
		address: values.address,
		city: values.city,
		country: values.country,
		province: values.province,
		postalCode: values.postalCode,
		mobile: mobileForIps(values.mobile),
		currency: isSocialBrand ? undefined : values.currency,
		secondaryCurrencies: isSocialBrand ? undefined : values.secondaryCurrencies,
		verificationTarget: values.verificationTarget,
		referralCode: values.referralCode,
		consentedVersions,
	});

export type QuickSignupValues = Pick<
	SignupValues,
	| "username"
	| "email"
	| "mobile"
	| "password"
	| "birthMonth"
	| "birthDay"
	| "birthYear"
	| "verificationTarget"
	| "referralCode"
	| "acceptTerms"
	| "acceptMarketing"
>;

// The /quickSignup body: just enough to open the account (QUICK_REG) in the Selected
// Brand; the name and address come later through quickSignupCompletion.
export const toQuickSignupRequest = (
	values: QuickSignupValues,
	{
		brandId,
		consentedVersions,
	}: { brandId: string | undefined; consentedVersions: string | undefined },
) =>
	withoutEmpty({
		brandId,
		username: values.username,
		email: values.email,
		mobile: mobileForIps(values.mobile),
		password: values.password,
		birthDate: formatBirthDate({
			month: values.birthMonth,
			day: values.birthDay,
			year: values.birthYear,
		}),
		verificationTarget: values.verificationTarget,
		referralCode: values.referralCode,
		consentedVersions,
	});

export type CompletionValues = Pick<
	SignupValues,
	| "firstName"
	| "lastName"
	| "address"
	| "city"
	| "country"
	| "province"
	| "postalCode"
>;

// The /quickSignupCompletion body: the details quick sign-up left out.
export const toCompletionRequest = (values: CompletionValues) =>
	withoutEmpty({ ...values });
