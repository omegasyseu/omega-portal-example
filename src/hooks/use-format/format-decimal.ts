export const NUMBER_LOCALE = "en-US";

const MISSING_VALUE = "N/A";
const NOT_A_NUMBER = "NaN";

const formatters = new Map<number, Intl.NumberFormat>();

const getFormatter = (fractionDigits: number) => {
	let formatter = formatters.get(fractionDigits);
	if (!formatter) {
		formatter = new Intl.NumberFormat(NUMBER_LOCALE, {
			minimumFractionDigits: fractionDigits,
			maximumFractionDigits: fractionDigits,
		});
		formatters.set(fractionDigits, formatter);
	}
	return formatter;
};

// A value that rounds to zero prints without a sign ("-0.00" -> "0.00"). Intl's
// signDisplay "negative" does this too, but throws on engines without
// Intl.NumberFormat v3 (e.g. Firefox 115), which Vite 8 still targets.
const NEGATIVE_ZERO = /^-(0\.?0*)$/;

// Intl gets the value as a decimal string so 1.005 rounds to 1.01, not to
// 1.00 from its binary value 1.00499...
export const formatDecimal = (value: number, fractionDigits: number) =>
	getFormatter(fractionDigits)
		.format(String(value) as Intl.StringNumericLiteral)
		.replace(NEGATIVE_ZERO, "$1");

// parseFloat, like numerable: "12.50 USD" reads as 12.5.
export const toNumber = (value: string | number) =>
	typeof value === "number" ? value : Number.parseFloat(value);

export const formatOrPlaceholder = (
	value: string | number | null | undefined,
	fractionDigits: number,
) => {
	if (value === null || value === undefined) return MISSING_VALUE;
	const number = toNumber(value);
	return Number.isNaN(number)
		? NOT_A_NUMBER
		: formatDecimal(number, fractionDigits);
};
