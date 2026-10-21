import {
	keepPreviousData,
	queryOptions,
	useQuery,
} from "@tanstack/react-query";
import { getCurrencyFromMap } from "@/hooks/use-format/fomatCurrencySymbol";
import { formatFiat } from "@/hooks/use-format/formatFiat";
import { useSession } from "@/providers/authentication/authentication.tsx";
import type { GamingHistoryResType } from "@/schemas-types/profile/transaction-history.ts";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

type GamingHistory = {
	startDateTime: string;
	endDateTime: string;
	type: "game" | "transfer";
	sessionKey?: string;
};

const getUserGamingHistory = async ({
	sessionKey,
	endDateTime,
	startDateTime,
	type,
}: GamingHistory) => {
	const API = "/getTransactionHistoryByCurrency";
	try {
		const res = await IPS_AXIOS_CLIENT.get<GamingHistoryResType>(API, {
			params: {
				sessionKey,
				startDateTime,
				endDateTime,
				type,
				// IPS defaults to 100 rows per page; the CSV export needs the whole range (D2-10084)
				pageNum: 1,
				pageSize: 10000,
			},
		});
		return res.data;
	} catch (e) {
		console.error("Error fetching user game history:", e);
		throw e;
	}
};

export const GetGamingHistoryOptions = ({
	sessionKey,
	startDateTime,
	endDateTime,
	type = "game",
}: GamingHistory) => {
	return queryOptions({
		queryKey: ["getGamingHistory", { startDateTime, endDateTime, type }],
		queryFn: () =>
			getUserGamingHistory({
				sessionKey,
				startDateTime,
				endDateTime,
				type,
			}),
		enabled: !!sessionKey && !!startDateTime && !!endDateTime,

		gcTime: 1000 * 60 * 60 * 24,
		// stale time 5 mins
		staleTime: 1000 * 60 * 5,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
		select: (data) => {
			return {
				status: data?.status,
				totalRecords: data?.totalRecords,
				transactionList: data?.transactionList?.map((history) => {
					return {
						date: history?.dateTimeFormatted,
						game: history?.gameName,
						type: history?.tranType,
						amount: `${getCurrencyFromMap(history?.currency)} ${formatFiat(
							history?.amount,
						)}`,
						balance: `${getCurrencyFromMap(history?.currency)} ${formatFiat(
							history?.postBalance,
						)}`,
						id: history?.id,
						currency: history?.currency,
					};
				}),
			};
		},
	});
};

export const useGetGamingHistory = ({
	startDateTime,
	endDateTime,
}: Omit<GamingHistory, "sessionKey" | "type">) => {
	const { session } = useSession();
	return useQuery({
		...GetGamingHistoryOptions({
			sessionKey: session?.user?.sessionKey,
			startDateTime,
			endDateTime,
			type: "game",
		}),
	});
};
