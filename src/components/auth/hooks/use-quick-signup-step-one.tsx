import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useGoToAuthStep } from "@/components/auth/hooks/use-auth-dialog.ts";
import { useTempInfo } from "@/components/auth/hooks/use-temp-info.tsx";
import type { toQuickSignupRequest } from "@/components/auth/signup-model.ts";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";

type QuickSignupRequest = ReturnType<typeof toQuickSignupRequest>;

export const useQuickSignupStepOne = () => {
	const goToStep = useGoToAuthStep();
	const { setTempUserInfo } = useTempInfo();
	return useMutation({
		mutationKey: ["quick-signupStepOne"],
		// The body comes from toQuickSignupRequest: empty values are already left out.
		mutationFn: async (request: QuickSignupRequest) => {
			const API = "/quickSignup";
			try {
				const res = await IPS_AXIOS_CLIENT.post(API, request);
				return res.data;
			} catch (e) {
				console.error("Error quick-signup step 1:", e);
				throw e;
			}
		},
		onMutate: () => {
			notifications.show({
				id: "quick-signup-step-one",
				color: "brand",
				loading: true,
				title: "Signing up",
				message: "",
				autoClose: false,
				withCloseButton: false,
			});
		},
		onSuccess: async (_, variables) => {
			notifications.hide("quick-signup-step-one");
			setTempUserInfo({
				brandId: `${variables.brandId}`,
				password: `${variables.password}`,
				username: `${variables.username}`,
				verificationTarget: `${variables.verificationTarget}`,
				email: `${variables.email}`,
			});
			await goToStep("quick-signup-code", { username: variables.username });
		},
		onError: (error) => {
			if (error instanceof IPSErrors) {
				notifications.update({
					id: "quick-signup-step-one",
					message: error.formatErrors() || error.message,
					color: "danger",
					loading: false,
					withCloseButton: true,
				});
				console.log({
					error: error.formatErrors(),
				});
			} else {
				notifications.update({
					id: "quick-signup-step-one",
					message: "An unexpected error occurred",
					color: "danger",
					loading: false,
					withCloseButton: true,
					icon: <IconX />,
				});
				console.log({
					error: error.message,
				});
			}
		},
	});
};
