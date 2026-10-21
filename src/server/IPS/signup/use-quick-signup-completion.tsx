import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	type CompletionValues,
	toCompletionRequest,
} from "@/components/auth/signup-model.ts";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";

// Finishes a quick sign-up (QUICK_REG) with the details it left out. The player's info is
// fetched again afterwards, so the prompt to complete goes away.
export const useQuickSignupCompletion = () => {
	const { session } = useSession();
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["quick-signup-completion"],
		mutationFn: async (values: CompletionValues) => {
			const res = await IPS_AXIOS_CLIENT.post("/quickSignupCompletion", {
				sessionKey: session?.user?.sessionKey,
				...toCompletionRequest(values),
			});
			return res.data;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["player-info"] });
			notifications.show({
				color: "neon",
				icon: <IconCheck />,
				title: "Registration complete",
				message: "Your account is ready to play.",
			});
		},
		onError: (error) => {
			notifications.show({
				color: "danger",
				title: "Couldn't complete registration",
				message:
					error instanceof IPSErrors
						? error.formatErrors() || error.message
						: "An unexpected error occurred. Please try again.",
			});
		},
	});
};
