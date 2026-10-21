import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/providers/authentication/authentication.tsx";
import type { ReferFriendSchema } from "@/schemas-types";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";
import { ipsErrorMessage } from "@/server/IPS/ips-error-toast.tsx";

export const useReferAFriend = () => {
	const { session } = useSession();
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["refer-a-friend"],
		mutationFn: async ({
			notificationTarget,
			phones,
			emails,
		}: Omit<ReferFriendSchema, "sessionKey">) => {
			const API = "/referFriend";
			try {
				const res = await IPS_AXIOS_CLIENT.post(API, {
					sessionKey: session?.user?.sessionKey,
					...(notificationTarget && { notificationTarget }),
					...(phones && { phones }),
					...(emails && { emails }),
				});
				return res.data;
			} catch (e) {
				console.error("Error referring a friend:", e);
				throw e;
			}
		},
		// onMutate: () => {
		// 	notifications.show({
		// 		id: "Refer-a-friend",
		// 		color: "brand",
		// 		loading: true,
		// 		title: "Refer a friend",
		// 		message: "",
		// 		autoClose: false,
		// 		withCloseButton: false,
		// 	});
		// },
		onSuccess: async () => {
			notifications.show({
				id: "Refer-a-friend",
				color: "neon",
				loading: false,
				title: "Refer A friend Successful",
				message: "",
				withCloseButton: true,
				icon: <IconCheck />,
			});
			await queryClient.invalidateQueries({
				queryKey: ["getReferees"],
			});
		},
		onError: (error) => {
			if (error instanceof IPSErrors) {
				notifications.update({
					id: "Refer-a-friend",
					message: ipsErrorMessage(
						error,
						error.formatErrors() || error.message,
					),
					color: "danger",
					loading: false,
					withCloseButton: true,
					icon: <IconX />,
				});
			} else {
				notifications.update({
					id: "Refer-a-friend",
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
