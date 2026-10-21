// What a player is told about their KYC Status (see GLOSSARY.md). IPS sends one of its
// KycStatus codes, or nothing when no check has started.
export type KycState =
	| "verified"
	| "actionNeeded"
	| "underReview"
	| "notVerified";

const KYC_STATE_BY_STATUS: Record<string, KycState> = {
	PASS: "verified",
	EXPERIAN_PASS: "verified",
	PASS_LV1: "verified",
	PASS_COND: "verified",
	OPEN: "actionNeeded",
	REQUESTED: "actionNeeded",
	ID_CHECK_REQUESTED: "actionNeeded",
	CHECK_NAME_ON_CARD: "actionNeeded",
	FAILED: "actionNeeded",
	EXPERIAN_FAILED: "actionNeeded",
	PENDING: "underReview",
	REFER: "underReview",
	INTERNAL_REFER: "underReview",
	EXPERIAN_REFER: "underReview",
	EXPERIAN_ERROR: "underReview",
	// IPS's UNKNOWN status
	"N/A": "notVerified",
};

// Account problems (SECURITY_ALERT, FRAUD, SUSPENDED) and codes this portal doesn't know
// are never shown as KYC: null.
export const kycState = (kycStatus: string | null | undefined) =>
	kycStatus ? (KYC_STATE_BY_STATUS[kycStatus] ?? null) : "notVerified";
