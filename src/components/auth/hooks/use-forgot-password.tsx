import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useGoToAuthStep } from "@/components/auth/hooks/use-auth-dialog.ts";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";

export const useForgotPassword = () => {
	const goToStep = useGoToAuthStep();

	const API = "/forgotPasswordStep1And2";
	return useMutation({
		mutationKey: ["forgot-password"],
		mutationFn: async (email: string) => {
			const response = await IPS_AXIOS_CLIENT.post(API, {
				email,
			});
			return response.data;
		},
		onMutate: () => {
			notifications.show({
				id: "forgot-password",
				color: "brand",
				loading: true,
				title: "Sending code",
				message: "",
				autoClose: false,
				withCloseButton: false,
			});
		},
		onSuccess: () => {
			notifications.update({
				id: "forgot-password",
				color: "neon",
				loading: false,
				title: "Code sent",
				message: "Check your email for the code to reset your password.",
				autoClose: true,
				withCloseButton: true,
				icon: <IconCheck />,
			});
			void goToStep("reset-password");
		},
		onError: (error) => {
			if (error instanceof IPSErrors) {
				notifications.update({
					id: "forgot-password",
					message: error.formatErrors() || error.message,
					color: "danger",
					loading: false,
					withCloseButton: true,
				});
			} else {
				notifications.update({
					id: "forgot-password",
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
