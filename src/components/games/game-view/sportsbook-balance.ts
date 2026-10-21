import type { QueryStatus } from "@tanstack/react-query";

export const SPORTSBOOK_BALANCE_REFETCH_MS = 5_000;
// While the balance can't be fetched, once a minute rather than every few seconds.
export const BALANCE_AFTER_ERROR_REFETCH_MS = 60_000;

// How often the balance is asked for again while a sportsbook is open. Every reader of
// the query shares the refetches, and they pause while the page's tab is in the
// background.
export const sportsbookBalanceRefetchInterval = (query: {
	state: { status: QueryStatus };
}) =>
	query.state.status === "error"
		? BALANCE_AFTER_ERROR_REFETCH_MS
		: SPORTSBOOK_BALANCE_REFETCH_MS;
