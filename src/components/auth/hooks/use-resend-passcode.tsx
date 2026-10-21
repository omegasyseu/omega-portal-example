import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useTempInfo } from "@/components/auth/hooks/use-temp-info.tsx";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";

export const useResendPasscode = () => {
	const { tempInfoUser } = useTempInfo();

	return useMutation({
		mutationKey: ["resend-passcode"],
		mutationFn: async () => {
			const API = "/resendVerificationCode";
			try {
				const res = await IPS_AXIOS_CLIENT.post(API, {
					username: tempInfoUser?.username,
					verificationTarget: tempInfoUser?.verificationTarget,
					...(tempInfoUser?.brandId && { brandId: tempInfoUser?.brandId }),
				});
				return res.data;
			} catch (e) {
				console.error("Error resending passcode:", e);
				throw e;
			}
		},
		onMutate: () => {
			notifications.show({
				id: "code",
				color: "brand",
				loading: true,
				title: "Sending code",
				message: "",
				autoClose: false,
				withCloseButton: false,
			});
		},
		onSuccess: async () => {
			notifications.update({
				id: "code",
				color: "neon",
				loading: false,
				title: "Code Sent",
				message: "",
				autoClose: false,
				withCloseButton: true,
				icon: <IconCheck />,
			});
		},
		onError: (error) => {
			if (error instanceof IPSErrors) {
				notifications.update({
					id: "code",
					message: error.formatErrors() || error.message,
					color: "danger",
					loading: false,
					withCloseButton: true,
				});
			} else {
				notifications.update({
					id: "code",
					message: "An unexpected error occurred",
					color: "danger",
					loading: false,
					withCloseButton: true,
					icon: <IconX />,
				});
			}
		},
	});
};
