import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";

// TanStack Query never polls on a server, and it takes a page without a window for one.
// Tests run in Node, so they get a bare window before it loads.
vi.hoisted(() => {
	vi.stubGlobal("window", {
		addEventListener: () => {},
		removeEventListener: () => {},
	});
});

import {
	focusManager,
	QueryClient,
	QueryObserver,
} from "@tanstack/react-query";
import {
	BALANCE_AFTER_ERROR_REFETCH_MS,
	SPORTSBOOK_BALANCE_REFETCH_MS,
	sportsbookBalanceRefetchInterval,
} from "./sportsbook-balance.ts";

// The balance query as the header reads it, with its fetches counted.
const watchBalance = (client: QueryClient) => {
	const fetchBalance = vi.fn().mockResolvedValue({ currencyBalances: [] });
	const observe = (options = {}) =>
		new QueryObserver(client, {
			queryKey: ["IPS_USER_BALANCES"],
			queryFn: fetchBalance,
			...options,
		}).subscribe(() => {});
	const openSportsbook = () =>
		observe({ refetchInterval: sportsbookBalanceRefetchInterval });
	return { fetchBalance, observe, openSportsbook };
};

afterAll(() => {
	vi.unstubAllGlobals();
});

describe("sportsbookBalanceRefetchInterval", () => {
	let client: QueryClient;

	beforeEach(() => {
		vi.useFakeTimers();
		// As the portal's client (main.tsx): a failed request isn't retried.
		client = new QueryClient({ defaultOptions: { queries: { retry: 0 } } });
		focusManager.setFocused(true);
	});

	afterEach(() => {
		client.clear();
		focusManager.setFocused(undefined);
		vi.useRealTimers();
	});

	it("refetches the header's balance every few seconds while the sportsbook is open", async () => {
		const { fetchBalance, observe, openSportsbook } = watchBalance(client);
		observe();
		openSportsbook();
		await vi.advanceTimersByTimeAsync(0);
		expect(fetchBalance).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(SPORTSBOOK_BALANCE_REFETCH_MS);
		expect(fetchBalance).toHaveBeenCalledTimes(2);
		await vi.advanceTimersByTimeAsync(SPORTSBOOK_BALANCE_REFETCH_MS);
		expect(fetchBalance).toHaveBeenCalledTimes(3);
	});

	it("asks less often while the balance can't be fetched, then picks up again", async () => {
		const { fetchBalance, openSportsbook } = watchBalance(client);
		fetchBalance.mockRejectedValue(new Error("IPS is down"));
		openSportsbook();
		await vi.advanceTimersByTimeAsync(0);

		// Not again until a minute after the failure.
		await vi.advanceTimersByTimeAsync(BALANCE_AFTER_ERROR_REFETCH_MS - 1);
		expect(fetchBalance).toHaveBeenCalledTimes(1);

		fetchBalance.mockResolvedValue({ currencyBalances: [] });
		await vi.advanceTimersByTimeAsync(1);
		expect(fetchBalance).toHaveBeenCalledTimes(2);
		await vi.advanceTimersByTimeAsync(SPORTSBOOK_BALANCE_REFETCH_MS);
		expect(fetchBalance).toHaveBeenCalledTimes(3);
	});

	it("stops once the sportsbook is closed", async () => {
		const { fetchBalance, observe, openSportsbook } = watchBalance(client);
		observe();
		const closeSportsbook = openSportsbook();
		await vi.advanceTimersByTimeAsync(SPORTSBOOK_BALANCE_REFETCH_MS);
		const fetchesWhileOpen = fetchBalance.mock.calls.length;

		closeSportsbook();
		await vi.advanceTimersByTimeAsync(SPORTSBOOK_BALANCE_REFETCH_MS * 3);
		expect(fetchBalance).toHaveBeenCalledTimes(fetchesWhileOpen);
	});

	it("waits while the player is on another tab", async () => {
		const { fetchBalance, openSportsbook } = watchBalance(client);
		openSportsbook();
		await vi.advanceTimersByTimeAsync(0);
		focusManager.setFocused(false);

		await vi.advanceTimersByTimeAsync(SPORTSBOOK_BALANCE_REFETCH_MS * 3);
		expect(fetchBalance).toHaveBeenCalledTimes(1);
	});
});
