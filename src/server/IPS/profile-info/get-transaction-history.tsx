import {
	keepPreviousData,
	queryOptions,
	useQuery,
} from "@tanstack/react-query";
import { getCurrencyFromMap } from "@/hooks/use-format/fomatCurrencySymbol";
import { formatFiat } from "@/hooks/use-format/formatFiat";
import { useSession } from "@/providers/authentication/authentication.tsx";
import type { TransactionHistoryType } from "@/schemas-types/profile/transaction-history.ts";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

type Params = {
	startDate: string;
	endDate: string;
	order?: string;
	sessionKey?: string;
};

const getUserTransactionHistory = async ({
	endDate,
	startDate,
	sessionKey,
	order,
}: Params) => {
	const API = "/getBankingHistory";

	try {
		const res = await IPS_AXIOS_CLIENT.get<TransactionHistoryType>(API, {
			params: {
				sessionKey,
				endDate,
				startDate,
				order,
			},
		});
		const status = res?.data?.status;
		const histories = res?.data?.histories?.map((history) => {
			return {
				// A pending withdrawal has no process date yet, so it shows when it was requested.
				date: history?.processDate || history?.requestDate,
				type: history?.type,
				amount: `${getCurrencyFromMap(history?.currency)} ${formatFiat(
					Number(history?.amount ?? 0) +
						Number(history?.amountPlayableBonus ?? 0),
				)}`,
				currency: history?.currency,
				method: history?.method,
				id: history?.id,
				status: history?.status,
			};
		});
		return {
			status,
			histories,
		};
	} catch (e) {
		console.error("Error fetching transaction history:", e);
		throw e;
	}
};

export const GetTransactionHistoryOptions = ({
	sessionKey,
	endDate,
	startDate,
	order,
}: Params) => {
	return queryOptions({
		queryKey: ["getTransactionHistory", { endDate, startDate, order }],
		queryFn: () =>
			getUserTransactionHistory({
				sessionKey,
				endDate,
				startDate,
				order,
			}),
		enabled: !!sessionKey && !!startDate && !!endDate,
		// gcTime: 1000 * 60 * 60 * 24,
		// staleTime: 1000 * 60 * 5,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
};

export const useGetTransactionHistory = ({
	endDate,
	startDate,
	order,
}: Omit<Params, "sessionKey">) => {
	const { session } = useSession();
	return useQuery({
		...GetTransactionHistoryOptions({
			sessionKey: session?.user?.sessionKey,

			startDate,
			order,
			endDate,
		}),
	});
};
