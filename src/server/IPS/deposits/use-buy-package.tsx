import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";
import { showIpsErrorToast } from "@/server/IPS/ips-error-toast.tsx";

type Props = {
	currency: string;
	packageId: string;
	paymentMethod: string;
};

export const useBuyPackage = () => {
	const { session } = useSession();
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["buy-package"],
		mutationFn: async ({ packageId, paymentMethod, currency }: Props) => {
			const API = "/purchasePackage";
			try {
				const res = await IPS_AXIOS_CLIENT.post(API, {
					sessionKey: session?.user?.sessionKey,
					brandId: session?.user?.loggedInBrand?.id,
					currency,
					packageId,
					paymentMethod,
				});
				return res.data;
			} catch (e) {
				console.error("Error buying package:", e);
				throw e;
			}
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["IPS_USER_BALANCES"],
			});
			notifications.show({
				message: "Package Bought Successfully",
				color: "neon",
				icon: <IconCheck />,
			});
		},
		onError: showIpsErrorToast,
	});
};
