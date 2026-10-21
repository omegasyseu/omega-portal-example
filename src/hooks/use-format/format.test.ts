import { describe, expect, it } from "vitest";
import {
	formatCurrency,
	formatNumByCurrency,
	getCurrencySymbol,
} from "@/hooks/use-format/fomatCurrencySymbol";
import { formatFiat } from "@/hooks/use-format/formatFiat";
import { formatNumber } from "@/hooks/use-format/formatNumber";

describe("formatFiat", () => {
	it.each([
		[0, "0.00"],
		[1234.5, "1,234.50"],
		[-1234.567, "-1,234.57"],
		[1234567.891, "1,234,567.89"],
		[0.005, "0.01"],
		["12.3", "12.30"],
		["12.50 USD", "12.50"],
		["0x10", "0.00"],
		["abc", "NaN"],
	])("formats %j as %j", (value, expected) => {
		expect(formatFiat(value)).toBe(expected);
	});

	it("shows N/A for a missing amount", () => {
		expect(formatFiat(undefined as unknown as number)).toBe("N/A");
	});
});

describe("formatNumber", () => {
	it.each([
		[0, "0"],
		[1234.5, "1,235"],
		[-1234.567, "-1,235"],
		[1234567.891, "1,234,568"],
		["12.3", "12"],
	])("formats %j as %j", (value, expected) => {
		expect(formatNumber(value)).toBe(expected);
	});

	it("shows N/A for a missing number", () => {
		expect(formatNumber(undefined as unknown as number)).toBe("N/A");
	});
});

describe("formatCurrency", () => {
	const currency = (decimal: number) => ({
		decimal,
		isoCode: "EUR",
		name: "Euro",
		symbol: "€",
	});

	it.each([
		[2, "€ 1,234.57"],
		[3, "€ 1,234.568"],
		[8, "€ 1,234.56780000"],
		// Known quirk, kept for now: zero-decimal currencies get a trailing dot.
		[0, "€ 1,235."],
	])("uses the currency's %i decimals", (decimal, expected) => {
		expect(formatCurrency(1234.5678, currency(decimal))).toBe(expected);
	});
});

describe("formatNumByCurrency", () => {
	// Same separators as the balance and RG limits, whatever the currency.
	it.each([
		[1051.15, "EUR", "€ 1,051.15"],
		[19.4, "EUR", "€ 19.40"],
		[1234567.891, "USD", "$ 1,234,567.89"],
		// Each currency keeps its own decimals.
		[1051.15, "JPY", "¥ 1,051"],
		[1.2345, "KWD", "KD 1.235"],
	])("formats %j %s as %j", (value, currency, expected) => {
		expect(formatNumByCurrency(value, currency)).toBe(expected);
	});

	it("shows no symbol when the currency is missing", () => {
		expect(formatNumByCurrency(1000, undefined)).toBe("1,000.00");
	});
});

describe("getCurrencySymbol", () => {
	it.each([
		["USD", "$"],
		["EUR", "€"],
		["GBP", "£"],
		["JPY", "¥"],
		["CAD", "CA$"],
		["PHP", "PHP"],
		["XOF", "CFA"],
	])("returns the symbol for %s", (code, expected) => {
		expect(getCurrencySymbol(code)).toBe(expected);
	});

	it("returns an empty symbol when no currency is given", () => {
		expect(getCurrencySymbol(undefined)).toBe("");
	});
});
