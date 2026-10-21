import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";
import { ipsErrorMessage } from "@/server/IPS/ips-error-toast.tsx";

export const useChangePassword = () => {
	const { session } = useSession();
	const API = "/updatePassword";
	return useMutation({
		mutationKey: ["changePassword"],
		mutationFn: async ({
			newPassword,
			oldPassword,
		}: {
			newPassword: string;
			oldPassword: string;
		}) => {
			try {
				const res = await IPS_AXIOS_CLIENT.post(API, {
					sessionKey: session?.user?.sessionKey,
					newPassword,
					oldPassword,
				});
				return res.data;
			} catch (e) {
				console.error("Error updating password:", e);
				throw e;
			}
		},
		onSuccess: async () => {
			notifications.show({
				id: "password-update",
				color: "neon",
				loading: false,
				title: "Password updated",
				message: "",
				autoClose: false,
				withCloseButton: true,
				icon: <IconCheck />,
			});
		},
		onError: (error) => {
			if (error instanceof IPSErrors) {
				notifications.update({
					id: "password-update",
					message: ipsErrorMessage(
						error,
						error.formatErrors() || error.message,
					),
					color: "danger",
					loading: false,
					withCloseButton: true,
				});
			} else {
				notifications.update({
					id: "password-update",
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
