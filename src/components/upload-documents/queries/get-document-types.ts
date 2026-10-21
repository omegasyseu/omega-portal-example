import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
	type Session,
	useSession,
} from "@/providers/authentication/authentication.tsx";
import { BASE_RESPONSE_SCHEMA } from "@/schemas-types";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

export const DocumentTypes = z
	.object({
		documentTypes: z.array(
			z.object({
				documentType: z.string(),
				issueDateRequired: z.boolean(),
				expiryDateRequired: z.boolean(),
				documentNumberRequired: z.boolean(),
				multipleFileRequired: z.boolean(),
			}),
		),
	})
	.merge(BASE_RESPONSE_SCHEMA);
type ResponseType = z.infer<typeof DocumentTypes>;

const getDocumentTypes = async (session: Session) => {
	const API = "/getDocumentTypes";
	try {
		const res = await IPS_AXIOS_CLIENT.get<ResponseType>(API, {
			params: {
				sessionKey: session?.user?.sessionKey,
			},
		});
		return res.data;
	} catch (e) {
		console.error("Error fetching challenge badge:", e);
		throw e;
	}
};
const GetDocumentTypes = (session: Session) => {
	return queryOptions({
		queryKey: [
			"Get-DOCUMENTS-types",
			{ sessionKey: session?.user?.sessionKey },
		],
		queryFn: async () => await getDocumentTypes(session),
		enabled: !!session?.user?.sessionKey && !!session?.user,
	});
};

export const useGetDocumentTypes = () => {
	const { session } = useSession();
	return useQuery({
		...GetDocumentTypes(session),
	});
};
