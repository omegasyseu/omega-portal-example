import { describe, expect, it } from "vitest";
import { getSupportedWithdrawalMethod } from "@/constants/payments";

describe("getSupportedWithdrawalMethod", () => {
	it("does not offer saved payment information for OMEGA_BANK withdrawals", () => {
		expect(
			getSupportedWithdrawalMethod("OMEGA_BANK")
				?.canSelectSavedPaymentInformation,
		).toBe(false);
	});

	it("lets PAYCOM withdrawals pick saved payment information", () => {
		expect(
			getSupportedWithdrawalMethod("PAYCOM")?.canSelectSavedPaymentInformation,
		).toBe(true);
	});

	it("returns nothing for a method the portal does not support", () => {
		expect(getSupportedWithdrawalMethod("UNKNOWN")).toBeUndefined();
	});
});
