import { describe, expect, it } from "vitest";
import {
	moneyLimitChanges,
	pendingLimitNote,
	pendingSessionNote,
	unsavedLimitFields,
} from "@/components/responsible-gaming/limit-rows.ts";
import type { ResponsibleGamingLimit } from "@/schemas-types/responsible-gaming";

const row = (
	fields: Partial<ResponsibleGamingLimit> &
		Pick<ResponsibleGamingLimit, "periodType" | "status">,
): ResponsibleGamingLimit => ({
	responsibleGamingLimitID: 1,
	limitType: "DEPOSIT_LIMIT",
	...fields,
});

const limits = [
	row({ periodType: "Daily", status: "ACTIVE", limit: 100 }),
	row({ periodType: "Weekly", status: "ACTIVE", limit: 500 }),
];

describe("moneyLimitChanges", () => {
	it("sends nothing when no field changed", () => {
		expect(
			moneyLimitChanges("DEPOSIT_LIMIT", limits, {
				Daily: 100,
				Weekly: 500,
				Monthly: "",
			}),
		).toEqual([]);
	});

	it("sends each changed period as its own change, in period order", () => {
		expect(
			moneyLimitChanges("DEPOSIT_LIMIT", limits, {
				Daily: 50,
				Weekly: 500,
				Monthly: 2000,
			}),
		).toEqual([
			{ limitType: "DEPOSIT_LIMIT", periodType: "Daily", limit: 50 },
			{ limitType: "DEPOSIT_LIMIT", periodType: "Monthly", limit: 2000 },
		]);
	});

	it("removes a limit whose field was cleared", () => {
		expect(
			moneyLimitChanges("DEPOSIT_LIMIT", limits, {
				Daily: 100,
				Weekly: "",
				Monthly: "",
			}),
		).toEqual([
			{ limitType: "DEPOSIT_LIMIT", periodType: "Weekly", limit: null },
		]);
	});

	it("only reads the card's own limit type", () => {
		expect(
			moneyLimitChanges("WAGER_LIMIT", limits, {
				Daily: "",
				Weekly: "",
				Monthly: "",
			}),
		).toEqual([]);
	});
});

describe("pendingLimitNote", () => {
	it("says when a raised limit takes over, and what applies until then", () => {
		expect(
			pendingLimitNote({
				periodType: "Weekly",
				pending: row({
					periodType: "Weekly",
					status: "PENDING",
					limit: 1000,
					effectiveDate: "10-10-2026",
				}),
				active: limits[1],
				currency: "EUR",
			}),
		).toBe(
			"your weekly limit rises to € 1,000.00 on 10-10-2026, after the Cool-down. Until then € 500.00 applies.",
		);
	});

	it("says when a removed limit stops applying", () => {
		expect(
			pendingLimitNote({
				periodType: "Daily",
				pending: row({
					periodType: "Daily",
					status: "PENDING",
					limit: null,
					effectiveDate: "10-10-2026",
				}),
				active: limits[0],
				currency: "EUR",
			}),
		).toBe(
			"your daily limit is removed on 10-10-2026, after the Cool-down. Until then € 100.00 applies.",
		);
	});

	it("falls back to the Cool-down when the date is missing", () => {
		expect(
			pendingLimitNote({
				periodType: "Daily",
				pending: row({ periodType: "Daily", status: "PENDING", limit: 300 }),
				active: limits[0],
				currency: "EUR",
			}),
		).toBe(
			"your daily limit rises to € 300.00 after the Cool-down. Until then € 100.00 applies.",
		);
	});
});

describe("pendingSessionNote", () => {
	it("says when a lengthened setting takes over", () => {
		expect(
			pendingSessionNote(
				row({
					limitType: "SESSION_LIMIT",
					periodType: "Permanent",
					status: "PENDING",
					limit: 60,
					effectiveDate: "10-10-2026",
				}),
			),
		).toBe("changes to 60 minutes on 10-10-2026, after the Cool-down.");
	});

	it("says when a setting turns off", () => {
		expect(
			pendingSessionNote(
				row({
					limitType: "REALITY_CHECK",
					periodType: "Permanent",
					status: "PENDING",
					limit: null,
				}),
			),
		).toBe("changes to Off after the Cool-down.");
	});
});

describe("unsavedLimitFields", () => {
	it("keeps the typed amounts that weren't saved, and the rejected one's reason", () => {
		expect(
			unsavedLimitFields(
				"DEPOSIT_LIMIT",
				[
					{ limitType: "DEPOSIT_LIMIT", periodType: "Weekly", limit: 5 },
					{ limitType: "DEPOSIT_LIMIT", periodType: "Monthly", limit: null },
				],
				"Weekly limit must be above the daily limit",
			),
		).toEqual({
			limitType: "DEPOSIT_LIMIT",
			values: { Weekly: 5, Monthly: "" },
			errors: { Weekly: "Weekly limit must be above the daily limit" },
		});
	});

	it("keeps the amounts without an error when the backend gave no reason", () => {
		expect(
			unsavedLimitFields(
				"DEPOSIT_LIMIT",
				[{ limitType: "DEPOSIT_LIMIT", periodType: "Weekly", limit: 5 }],
				null,
			),
		).toEqual({
			limitType: "DEPOSIT_LIMIT",
			values: { Weekly: 5 },
			errors: {},
		});
	});
});
