import { afterEach, describe, expect, it, vi } from "vitest";

// Firefox 114-115, Safari < 15.4 and Chrome < 106 predate Intl.NumberFormat v3: they throw a
// RangeError for signDisplay "negative". Vite 8's default build target still includes Firefox 114.
class NumberFormatWithoutV3 extends Intl.NumberFormat {
	constructor(locales?: string | string[], options?: Intl.NumberFormatOptions) {
		if (options?.signDisplay === "negative") {
			throw new RangeError("invalid value negative for option signDisplay");
		}
		super(locales, options);
	}
}

describe("formatters on engines without Intl.NumberFormat v3", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.resetModules();
	});

	it("still format amounts, including hiding negative zero", async () => {
		vi.stubGlobal("Intl", { ...Intl, NumberFormat: NumberFormatWithoutV3 });
		vi.resetModules();
		const { formatFiat } = await import("@/hooks/use-format/formatFiat");

		expect([
			formatFiat(1234.5),
			formatFiat(-1234.567),
			formatFiat(-0.004),
		]).toEqual(["1,234.50", "-1,234.57", "0.00"]);
	});
});
