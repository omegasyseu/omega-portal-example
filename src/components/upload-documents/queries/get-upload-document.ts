import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
	type Session,
	useSession,
} from "@/providers/authentication/authentication.tsx";
import { BASE_RESPONSE_SCHEMA } from "@/schemas-types";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

export const DocumentResponse = z
	.object({
		userDocuments: z.array(
			z.object({
				id: z.number(),
				documentType: z.string(),
				issueDate: z.string(),
				expiryDate: z.string(),
				uploadDate: z.string(),
				reviewDate: z.null(),
				documentNumber: z.string(),
				fileName: z.string(),
				status: z.string(),
				description: z.null(),
				userDocumentFiles: z.array(
					z.object({
						id: z.null(),
						fileName: z.string(),
						mimeType: z.string(),
						description: z.null(),
						data: z.null(),
					}),
				),
			}),
		),
	})
	.merge(BASE_RESPONSE_SCHEMA);
type ResponseType = z.infer<typeof DocumentResponse>;

const getDocuments = async (session: Session) => {
	const API = "/getUserDocuments";
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
const GetDocumentOptions = (session: Session) => {
	return queryOptions({
		queryKey: ["Get-DOCUMENTS", { sessionKey: session?.user?.sessionKey }],
		queryFn: async () => await getDocuments(session),
		enabled: !!session?.user?.sessionKey && !!session?.user,
	});
};

export const useGetDocuments = () => {
	const { session } = useSession();
	return useQuery({
		...GetDocumentOptions(session),
	});
};
