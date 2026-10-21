import { describe, expect, it } from "vitest";
import {
	shownPaymentMethod,
	shownPaymentMethods,
} from "@/components/payments/shown-payment-methods.ts";
import type { PaymentMethodSettings } from "@/providers/brand-content/brand-content.ts";

// IPS's methods for the player, in IPS's order, with the recommended one first.
const OFFERED = [
	{ code: "PAYMENTIQ_ALL", feeRate: "1.50" },
	{ code: "OMEGA_BANK", feeRate: "0.00" },
	{ code: "EVOUCHER", feeRate: "" },
];

const SETTINGS: PaymentMethodSettings = new Map([
	[
		"EVOUCHER",
		{
			deposit: true,
			withdrawal: false,
			name: "E-Voucher",
			logoUrl: "https://strapi.example.com/uploads/evoucher.png",
		},
	],
	[
		"OMEGA_BANK",
		{
			deposit: true,
			withdrawal: true,
			name: "Bank",
			logoUrl: "https://strapi.example.com/uploads/kambi_bank.png",
		},
	],
	[
		"PAYMENTIQ_ALL",
		{ deposit: false, withdrawal: true, name: "PaymentIQ", logoUrl: undefined },
	],
	[
		"COINSPAID_V2",
		{ deposit: true, withdrawal: true, name: "CoinsPaid", logoUrl: undefined },
	],
]);

const codesOf = (shown: { method: { code: string } }[]) =>
	shown.map(({ method }) => method.code);

describe("shownPaymentMethods", () => {
	it("shows only the methods IPS offers that the Brand switched on, in IPS's order", () => {
		expect(codesOf(shownPaymentMethods(OFFERED, SETTINGS, "deposit"))).toEqual([
			"OMEGA_BANK",
			"EVOUCHER",
		]);
	});

	it("judges deposits and withdrawals separately", () => {
		expect(
			codesOf(shownPaymentMethods(OFFERED, SETTINGS, "withdrawal")),
		).toEqual(["PAYMENTIQ_ALL", "OMEGA_BANK"]);
	});

	it("hides a method IPS offers that Strapi doesn't list", () => {
		const offered = [{ code: "SKRILL" }, { code: "OMEGA_BANK" }];
		expect(codesOf(shownPaymentMethods(offered, SETTINGS, "deposit"))).toEqual([
			"OMEGA_BANK",
		]);
	});

	it("never shows a method the Brand switched on that IPS doesn't offer", () => {
		expect(
			codesOf(shownPaymentMethods(OFFERED, SETTINGS, "deposit")),
		).not.toContain("COINSPAID_V2");
		expect(shownPaymentMethods([], SETTINGS, "deposit")).toEqual([]);
	});

	it("shows each method under the Brand's name and logo, keeping IPS's details", () => {
		expect(shownPaymentMethods(OFFERED, SETTINGS, "withdrawal")).toEqual([
			{
				method: { code: "PAYMENTIQ_ALL", feeRate: "1.50" },
				name: "PaymentIQ",
				logoUrl: undefined,
			},
			{
				method: { code: "OMEGA_BANK", feeRate: "0.00" },
				name: "Bank",
				logoUrl: "https://strapi.example.com/uploads/kambi_bank.png",
			},
		]);
	});

	it("shows nothing for a Brand with no Payment Method settings", () => {
		expect(shownPaymentMethods(OFFERED, new Map(), "deposit")).toEqual([]);
	});
});

describe("shownPaymentMethod", () => {
	const offeredCodes = OFFERED.map(({ code }) => code);

	it("gives the Brand's name and logo for a method IPS offers and the Brand shows in that direction", () => {
		expect(
			shownPaymentMethod("OMEGA_BANK", offeredCodes, SETTINGS, "deposit"),
		).toEqual({
			name: "Bank",
			logoUrl: "https://strapi.example.com/uploads/kambi_bank.png",
		});
		expect(
			shownPaymentMethod("PAYMENTIQ_ALL", offeredCodes, SETTINGS, "withdrawal"),
		).toEqual({ name: "PaymentIQ", logoUrl: undefined });
	});

	it("says a method is hidden when the Brand switched it off for that direction", () => {
		expect(
			shownPaymentMethod("EVOUCHER", offeredCodes, SETTINGS, "withdrawal"),
		).toBeUndefined();
		expect(
			shownPaymentMethod("PAYMENTIQ_ALL", offeredCodes, SETTINGS, "deposit"),
		).toBeUndefined();
	});

	it("says a method Strapi doesn't list is hidden", () => {
		expect(
			shownPaymentMethod("SKRILL", ["SKRILL"], SETTINGS, "deposit"),
		).toBeUndefined();
	});

	it("says a method IPS doesn't offer the player is hidden, even when the Brand shows it", () => {
		expect(
			shownPaymentMethod("COINSPAID_V2", offeredCodes, SETTINGS, "deposit"),
		).toBeUndefined();
		expect(
			shownPaymentMethod("OMEGA_BANK", [], SETTINGS, "deposit"),
		).toBeUndefined();
	});
});
