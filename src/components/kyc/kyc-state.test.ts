import { describe, expect, it } from "vitest";
import { kycState } from "./kyc-state.ts";

describe("kycState", () => {
	it.each(["PASS", "EXPERIAN_PASS", "PASS_LV1", "PASS_COND"])(
		"reads %s as verified",
		(status) => {
			expect(kycState(status)).toBe("verified");
		},
	);

	it.each([
		"OPEN",
		"REQUESTED",
		"ID_CHECK_REQUESTED",
		"CHECK_NAME_ON_CARD",
		"FAILED",
		"EXPERIAN_FAILED",
	])("reads %s as action needed", (status) => {
		expect(kycState(status)).toBe("actionNeeded");
	});

	it.each([
		"PENDING",
		"REFER",
		"INTERNAL_REFER",
		"EXPERIAN_REFER",
		"EXPERIAN_ERROR",
	])("reads %s as under review", (status) => {
		expect(kycState(status)).toBe("underReview");
	});

	it.each([null, undefined, "", "N/A"])(
		"reads a player with no check (%s) as not verified",
		(status) => {
			expect(kycState(status)).toBe("notVerified");
		},
	);

	it.each(["SECURITY_ALERT", "FRAUD", "SUSPENDED", "SOMETHING_NEW"])(
		"never shows %s as a KYC state",
		(status) => {
			expect(kycState(status)).toBeNull();
		},
	);
});
