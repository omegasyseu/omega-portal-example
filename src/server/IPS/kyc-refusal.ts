// IPS refuses an action over KYC in three shapes: a payment needing an ID check
// (ID_CHECK_REQUIRED), an action the brand restricts for a KYC or registration status
// (KYC_FAILED, REGISTRATION_KYCFAILED, ...), or a payment check that failed, which
// arrives as FAIL with a message starting "KYCFAILED-".
export const KYC_REFUSAL_LEAD =
	"We need to verify your identity before you can do this.";
// For messages that can't carry a link to the KYC card.
export const KYC_REFUSAL_MESSAGE = `${KYC_REFUSAL_LEAD} You can verify it from the KYC card on your profile.`;

export const isKycRefusal = ({
	status = "",
	message = "",
}: {
	status?: string;
	message?: string | null;
}) =>
	status === "ID_CHECK_REQUIRED" ||
	status.startsWith("KYC_") ||
	status.endsWith("KYCFAILED") ||
	(message ?? "").startsWith("KYCFAILED-");
