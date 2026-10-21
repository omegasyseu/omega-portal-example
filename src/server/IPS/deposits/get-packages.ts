import { useQuery } from "@tanstack/react-query";
import type { z } from "zod";
import {
	type Session,
	useSession,
} from "@/providers/authentication/authentication.tsx";
import type { PackageResponseSchema } from "@/schemas-types/packages";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

type Props = {
	session: Session | null;
	currency: string;
	paymentMethod?: string;
};
type ResponseType = z.infer<typeof PackageResponseSchema>;

export const getPackages = async ({
	session,
	currency,
	paymentMethod,
}: Props) => {
	const API = "/getPackage";

	try {
		const res = await IPS_AXIOS_CLIENT.get<ResponseType>(API, {
			params: {
				brandId: session?.user?.loggedInBrand?.id,
				sessionKey: session?.user?.sessionKey,
				currency,
				...(paymentMethod && { paymentMethod }),
			},
		});
		return res.data;
	} catch (e) {
		console.error("Error fetching packages:", e);
		throw e;
	}
};

export const useGetPackages = ({
	currency,
	paymentMethod,
}: Omit<Props, "session">) => {
	const { session } = useSession();

	return useQuery({
		queryKey: ["get-packages"],
		queryFn: async () =>
			await getPackages({
				session,
				currency,
				paymentMethod,
			}),
		enabled: false,
		gcTime: 0,
		// placeholderData: keepPreviousData,
	});
};
