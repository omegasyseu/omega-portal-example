import { NUMBER_LOCALE } from "@/hooks/use-format/format-decimal.ts";

// A rate of 1 or more shows two decimals; a smaller one keeps three significant digits
// however small it is (1 EUR = 0.0000096 BTC), so it never rounds to 0.
const LARGE_RATE_DECIMALS = 2;
const SMALL_RATE_SIGNIFICANT_DIGITS = 3;
const MAX_DECIMALS = 20;

const decimalsFor = (rate: number) =>
	rate >= 1
		? LARGE_RATE_DECIMALS
		: Math.min(
				MAX_DECIMALS,
				-Math.floor(Math.log10(rate)) + SMALL_RATE_SIGNIFICANT_DIGITS - 1,
			);

// "1 EUR = 1,716.55 ARS": what one unit of the player's money is worth in the game's
// currency. Undefined when IPS has no rate.
export const rateLabel = ({
	playerCurrency,
	gameCurrency,
	currentRate,
}: {
	playerCurrency: string;
	gameCurrency: string;
	currentRate: number;
}) => {
	if (!currentRate) return undefined;
	const rate = new Intl.NumberFormat(NUMBER_LOCALE, {
		maximumFractionDigits: decimalsFor(currentRate),
	}).format(currentRate);
	return `1 ${playerCurrency} = ${rate} ${gameCurrency}`;
};
