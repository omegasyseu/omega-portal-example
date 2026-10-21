import { useMutation } from "@tanstack/react-query";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";
import { showErrorToast } from "@/server/IPS/responsible-gaming/show-error-toast.tsx";

interface KycResponse {
	errors: string[];
	status: string;
	message: string | null;
	advices: string[];
	info: {
		token: string;
		firstName: string | null;
		lastName: string | null;
		birthDate: string | null;
		country: string | null;
		city: string | null;
		zipCode: string | null;
		address: string | null;
		kycStatus: string | null;
		documentType: string | null;
		documentNumber: string | null;
		documentExpires: string | null;
		redirectURL: string;
		gender: string | null;
		extraFields: unknown | null;
	};
}

// The provider's verification page, when IPS started the check and sent one.
export const kycVerificationPage = (data: KycResponse | undefined) =>
	data?.status === "SUCCESS" && data.info?.redirectURL
		? data.info.redirectURL
		: undefined;

// Starts the player's identity check with the brand's KYC provider: IPS answers with the
// provider's verification page (info.redirectURL). Errors, and an answer without a
// page, show as notifications.
// The check runs with the signed-in session, the one the KYC status (getPlayerInfo) is read
// with, so the status refreshed afterwards is the same player record's.
export const useStartKycCheck = () => {
	const { session } = useSession();
	return useMutation({
		mutationKey: ["start-kyc-check"],
		mutationFn: async () => {
			const sessionKey = session?.user?.sessionKey;
			if (!sessionKey) {
				throw new Error("No session to start the KYC check with");
			}
			const res = await IPS_AXIOS_CLIENT.get<KycResponse>("/user/kyc/info", {
				params: { sessionKey },
			});
			return res.data;
		},
		onSuccess: (data) => {
			if (!kycVerificationPage(data)) {
				showErrorToast(
					null,
					"The verification page isn't available right now. You can upload your documents in the Kyc tab instead.",
				);
			}
		},
		onError: (error) => {
			console.error("Error starting the KYC check:", error);
			showErrorToast(
				error,
				"We couldn't start the verification. Try again, or upload your documents in the Kyc tab.",
			);
		},
	});
};
