import currencyFormatter from "currency-formatter";
import { formatDecimal, NUMBER_LOCALE } from "../format-decimal";
import { CURRENCY_MAP } from "./currency-map";

export type FormatCurrencySymbol = (currencySymbol?: string) => string;

// Where the portal's symbol has always differed from Intl's.
const SYMBOL_OVERRIDES: Record<string, string> = { PHP: "PHP", XOF: "CFA" };

const symbols = new Map<string, string>(Object.entries(SYMBOL_OVERRIDES));

const lookUpSymbol = (code: string) => {
	try {
		return (
			new Intl.NumberFormat(NUMBER_LOCALE, {
				style: "currency",
				currency: code,
			})
				.formatToParts(0)
				.find((part) => part.type === "currency")?.value ?? code
		);
	} catch (error) {
		// Intl throws RangeError for a code that is not well formed; show it as given.
		if (error instanceof RangeError) {
			return code;
		}
		throw error;
	}
};

export const getCurrencySymbol: FormatCurrencySymbol = (currencySymbol) => {
	if (!currencySymbol) return "";
	const code = currencySymbol.toUpperCase();
	let symbol = symbols.get(code);
	if (symbol === undefined) {
		symbol = lookUpSymbol(code);
		symbols.set(code, symbol);
	}
	return symbol;
};

export const getCurrencyFromMap: FormatCurrencySymbol = (currencySymbol) => {
	const code = currencySymbol ? currencySymbol.toUpperCase() : "USD";
	return (CURRENCY_MAP[code] || currencySymbol) as string;
};

type CurrencyInfo = {
	decimal: number;
	isoCode: string;
	name: string;
	symbol: string;
};

export type FormatCurrency = (
	value: number,
	currencyInfo: CurrencyInfo,
) => string;

export const formatCurrency: FormatCurrency = (value, currencyInfo) => {
	const { decimal, symbol } = currencyInfo;
	if (value === null || value === undefined || Number.isNaN(value)) {
		return `${symbol} `;
	}
	const formattedNumber = formatDecimal(value, decimal);
	// Kept from numerable for now: zero-decimal amounts end in a dot.
	const trailingDot = decimal === 0 && Number.isFinite(value) ? "." : "";
	return `${symbol} ${formattedNumber}${trailingDot}`;
};

export type FormatNumByCurrency = (value: number, currency?: string) => string;

// Each currency's own decimals ("¥ 1,051", "KD 1.235") with the balance's separators, so
// euros read "€ 1,051.15", never "€ 1 051,15".
export const formatNumByCurrency: FormatNumByCurrency = (value, currency) =>
	currencyFormatter
		.format(value, {
			code: currency,
			symbol: currency ? getCurrencyFromMap(currency) : "",
			format: "%s %v",
			thousand: ",",
			decimal: ".",
		})
		.trim();
