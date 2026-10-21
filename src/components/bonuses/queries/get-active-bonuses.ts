import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
	type Session,
	useSession,
} from "@/providers/authentication/authentication.tsx";
import { BASE_RESPONSE_SCHEMA } from "@/schemas-types";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";

export const Bonus = z.object({
	id: z.number(),
	bonusPlanName: z.string(),
	bonusPlanId: z.number(),
	status: z.string(),
	expiryDate: z.string(),
	expiryDateFormatted: z.string(),
	triggerDate: z.string(),
	triggerDateFormatted: z.string(),
	releaseDate: z.string().nullable(),
	releaseDateFormatted: z.string().nullable(),
	amount: z.string(),
	amountNumber: z.number(),
	wagerRequirement: z.string(),
	wagerRequirementNumber: z.number(),
	amountWagered: z.string(),
	amountWageredNumber: z.number(),
	currency: z.string(),
	triggerType: z.string(),
	description: z.string().nullable(),
	// IPS sends null, not an empty list, when a Bonus has no game rules.
	restrictedGames: z.array(z.unknown()).nullable(),
	gameRestrictionType: z.null(),
	excludedGames: z.array(z.unknown()).nullable(),
	externalBonusPlanId: z.null(),
	recurringApplicable: z.boolean(),
	reference: z
		.object({
			completed: z.number(),
			total: z.number(),
			lastAwardDate: z.string(),
			lastAwardDateFormatted: z.string(),
		})
		.nullable()
		.optional(),
});

export type BonusType = z.infer<typeof Bonus>;

export const getBonuses = z
	.object({
		status: z.string(),
		bonuses: z.array(Bonus.optional()).optional(),
	})
	.merge(BASE_RESPONSE_SCHEMA);

type ResponseType = z.infer<typeof getBonuses>;

export const ACTIVE_BONUS_KEY = "active-bonuses";

const NOT_FOUND = "NOT_FOUND";

// IPS answers "this player has no Bonuses" with status NOT_FOUND, which the client throws
// like any other failure. That's an empty list, not an error, so it resolves as one.
export const noBonusesWhenNotFound = (error: unknown) => {
	if (error instanceof IPSErrors && error.status === NOT_FOUND) {
		return { status: NOT_FOUND, message: "", bonuses: [] };
	}
	console.error("Error fetching Bonuses:", error);
	throw error;
};

const getActiveBonuses = async (session: Session) => {
	const API = "/getActiveBonuses";
	try {
		const res = await IPS_AXIOS_CLIENT.get<ResponseType>(API, {
			params: {
				sessionKey: session?.user?.sessionKey,
			},
		});
		return res.data;
	} catch (e) {
		return noBonusesWhenNotFound(e);
	}
};
const getBonusesOptions = (session: Session) => {
	return queryOptions({
		queryKey: [ACTIVE_BONUS_KEY, { sessionKey: session?.user?.sessionKey }],
		queryFn: async () => await getActiveBonuses(session),
		enabled: !!session?.user?.sessionKey && !!session?.user,
	});
};

export const useGetActiveBonuses = () => {
	const { session } = useSession();
	return useQuery({
		...getBonusesOptions(session),
	});
};
