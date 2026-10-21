import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useGoToAuthStep } from "@/components/auth/hooks/use-auth-dialog.ts";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";

export const useResetPassword = () => {
	const API = "/forgotPasswordStep3";
	const goToStep = useGoToAuthStep();
	const [email, setEmail] = useLocalStorage({
		key: "portal-5-email-info",
	});

	return useMutation({
		mutationKey: ["reset-password"],
		mutationFn: async (data: {
			resetPasswordKey: string;
			newPassword: string;
		}) => {
			const response = await IPS_AXIOS_CLIENT.post(API, { ...data, email });
			return response.data;
		},
		onMutate: () => {
			notifications.show({
				id: "reset-password",
				color: "brand",
				loading: true,
				title: "Resetting password",
				message: "",
				autoClose: false,
				withCloseButton: false,
			});
		},
		onSuccess: async () => {
			notifications.update({
				id: "reset-password",
				color: "neon",
				loading: false,
				title: "Password reset",
				message: "Your password has been successfully reset.",
				autoClose: true,
				withCloseButton: true,
				icon: <IconCheck />,
			});
			setEmail("");
			void goToStep("login");
		},
		onError: (error) => {
			if (error instanceof IPSErrors) {
				notifications.update({
					id: "reset-password",
					message: error.formatErrors() || error.message,
					color: "danger",
					loading: false,
					withCloseButton: true,
				});
			} else {
				notifications.update({
					id: "reset-password",
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
