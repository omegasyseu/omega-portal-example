import { describe, expect, it } from "vitest";
import { isKycRefusal } from "./kyc-refusal.ts";

describe("isKycRefusal", () => {
	it("recognises a payment that needs an ID check", () => {
		expect(
			isKycRefusal({
				status: "ID_CHECK_REQUIRED",
				message: "KYC ID check required",
			}),
		).toBe(true);
	});

	it.each(["KYC_FAILED", "KYC_REQUESTED", "REGISTRATION_KYCFAILED"])(
		"recognises an action the brand blocks for %s",
		(status) => {
			expect(
				isKycRefusal({
					status,
					message: `Action: WITHDRAW is not allowed because of status: KYC - ${status}`,
				}),
			).toBe(true);
		},
	);

	it("recognises a payment refused because KYC failed", () => {
		expect(
			isKycRefusal({
				status: "FAIL",
				message: "KYCFAILED-An unexpected error occurred",
			}),
		).toBe(true);
	});

	it("leaves other failures alone", () => {
		expect(
			isKycRefusal({ status: "FAIL", message: "Insufficient funds" }),
		).toBe(false);
	});

	it("leaves a response without a status or message alone", () => {
		expect(isKycRefusal({})).toBe(false);
	});
});
