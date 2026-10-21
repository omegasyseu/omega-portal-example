import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useGoToAuthStep } from "@/components/auth/hooks/use-auth-dialog.ts";
import { useTempInfo } from "@/components/auth/hooks/use-temp-info.tsx";
import type { toSignupRequest } from "@/components/auth/signup-model.ts";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";
import { useLogin } from "./use-login";

type SignupRequest = ReturnType<typeof toSignupRequest>;

export const useSignup = () => {
	const API = "/signup";
	const goToStep = useGoToAuthStep();
	const { mutateAsync } = useLogin();
	const { setTempUserInfo } = useTempInfo();

	return useMutation({
		mutationKey: ["signup"],
		// The body comes from toSignupRequest: empty values are already left out.
		mutationFn: async (request: SignupRequest) => {
			try {
				const res = await IPS_AXIOS_CLIENT.post(API, request);
				return res.data;
			} catch (e) {
				console.error("Error signing up:", e);
				throw e;
			}
		},
		onMutate: () => {
			notifications.show({
				id: "signup-step-one",
				color: "brand",
				loading: true,
				title: "Signing up",
				message: "",
				autoClose: false,
				withCloseButton: false,
			});
		},
		onSuccess: async (response, variables) => {
			notifications.hide("signup-step-one");
			if (response.status === "SUCCESS" && response.sessionKey) {
				// If BE auto login is enabled, login again.
				// Technically its always logged in and can use sessionKey to proceed to next step, but missing logedInBrand. Will fix next day
				await mutateAsync({
					password: `${variables?.password}`,
					username: `${variables?.username}`,
					brandId: `${variables?.brandId}`,
				});
			} else {
				setTempUserInfo({
					brandId: `${variables.brandId}`,
					password: `${variables.password}`,
					username: `${variables.username}`,
					verificationTarget: `${variables.verificationTarget}`,
					email: `${variables.email}`,
				});
				await goToStep("signup-code", { username: variables.username });
			}
		},
		onError: (error) => {
			if (error instanceof IPSErrors) {
				notifications.update({
					id: "signup-step-one",
					message: error.formatErrors() || error.message,
					color: "danger",
					loading: false,
					withCloseButton: true,
					icon: <IconX />,
				});
			} else {
				notifications.update({
					id: "signup-step-one",
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
