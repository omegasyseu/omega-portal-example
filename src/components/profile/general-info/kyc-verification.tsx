import { Box, Modal } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import {
	kycVerificationPage,
	useStartKycCheck,
} from "@/server/IPS/start-kyc-check.tsx";

// The provider's verification page, shown while a KYC check has given us its URL.
export function KycModal({
	url,
	onClose,
}: {
	url: string;
	onClose: () => void;
}) {
	return (
		<Modal
			opened={Boolean(url)}
			onClose={onClose}
			title="KYC Verification"
			closeOnClickOutside={false}
			size="xl"
			centered
			styles={{
				content: {
					height: "100dvh",
				},
				body: {
					height: "calc(100dvh - 60px)",
					padding: 0,
				},
			}}
		>
			<Box h="100%">
				{url && (
					<iframe
						src={url}
						width="100%"
						height="100%"
						style={{
							border: "none",
							borderRadius: "4px",
						}}
						title="KYC Verification"
						sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation allow-popups"
					/>
				)}
			</Box>
		</Modal>
	);
}

// Starts the KYC provider's check; its verification page stays open until closed.
export const useKycCheck = () => {
	const queryClient = useQueryClient();
	const kycCheck = useStartKycCheck();

	// The player may have finished the provider's check, so fetch their KYC status again.
	const handleKycModalClose = () => {
		kycCheck.reset();
		void queryClient.invalidateQueries({ queryKey: ["player-info"] });
	};

	return {
		kycRedirectUrl: kycVerificationPage(kycCheck.data) ?? "",
		isLoadingKyc: kycCheck.isPending,
		handleKycClick: () => kycCheck.mutate(),
		handleKycModalClose,
	};
};
