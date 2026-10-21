import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useLogin } from "@/components/auth/hooks/use-login.tsx";
import { useTempInfo } from "@/components/auth/hooks/use-temp-info.tsx";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";

type Params = {
	confirmationCode: string;
};

export const useQuickSignupStepTwo = () => {
	const { tempInfoUser, resetTempInfo } = useTempInfo();
	const { mutateAsync } = useLogin();
	return useMutation({
		mutationKey: ["step-two"],
		mutationFn: async ({ confirmationCode }: Params) => {
			const API = "/signupConfirmation";
			try {
				const res = await IPS_AXIOS_CLIENT.post(API, {
					email: tempInfoUser?.email,
					confirmationCode: confirmationCode,
					...(tempInfoUser?.brandId && { brandId: tempInfoUser?.brandId }),
				});
				return res.data;
			} catch (e) {
				console.error("Error quick-signup step 2:", e);
				throw e;
			}
		},
		onMutate: () => {
			notifications.show({
				id: "signup",
				color: "brand",
				loading: true,
				title: "Signing up",
				message: "",
				autoClose: false,
				withCloseButton: false,
			});
		},
		onSuccess: async () => {
			await mutateAsync({
				password: `${tempInfoUser?.password}`,
				username: `${tempInfoUser?.username}`,
				brandId: `${tempInfoUser?.brandId}`,
			}).then(() => {
				resetTempInfo();
				notifications.hide("signup");
			});
		},
		onError: (error) => {
			if (error instanceof IPSErrors) {
				notifications.update({
					id: "signup",
					message: error.formatErrors() || error.message,
					color: "danger",
					loading: false,
					withCloseButton: true,
					icon: <IconX />,
				});
			} else {
				notifications.update({
					id: "signup",
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
