import { afterAll, describe, expect, it } from "vitest";
import {
	historyDays,
	historyDayTimes,
	historyRange,
} from "@/components/profile/history-range.ts";

// A player ahead of UTC, so turning their picked days into UTC would show up as a shift.
const ORIGINAL_TZ = process.env.TZ;
process.env.TZ = "Asia/Hong_Kong";
afterAll(() => {
	if (ORIGINAL_TZ === undefined) {
		delete process.env.TZ;
	} else {
		process.env.TZ = ORIGINAL_TZ;
	}
});

// Saturday 3 October 2026, 14:30 local time.
const NOW = new Date(2026, 9, 3, 14, 30);

describe("historyRange", () => {
	it("covers today for Day", () => {
		expect(historyRange("day", NOW)).toEqual({
			from: new Date(2026, 9, 3),
			to: NOW,
		});
	});

	it("covers the last seven days, today included, for Week", () => {
		expect(historyRange("week", NOW)).toEqual({
			from: new Date(2026, 8, 27),
			to: NOW,
		});
	});

	it("covers the last month for Month", () => {
		expect(historyRange("month", NOW)).toEqual({
			from: new Date(2026, 8, 3),
			to: NOW,
		});
	});
});

describe("historyDays", () => {
	it("sends the picked days as written, whatever the time on the To day", () => {
		expect(
			historyDays({
				from: new Date(2026, 9, 3),
				to: new Date(2026, 9, 4, 23, 59, 59, 999),
			}),
		).toEqual({ from: "2026-10-03", to: "2026-10-04" });
	});
});

describe("historyDayTimes", () => {
	it("runs from the start of the From day to the start of the day after To, unshifted", () => {
		expect(historyDayTimes({ from: new Date(2026, 9, 3), to: NOW })).toEqual({
			from: "2026-10-03T00:00:00Z",
			to: "2026-10-04T00:00:00Z",
		});
	});
});
