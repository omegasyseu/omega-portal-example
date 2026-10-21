import { formatOrPlaceholder } from "../format-decimal";

const FIAT_FRACTION_DIGITS = 2;

export type FormatFiat = (value: string | number) => string;

export const formatFiat: FormatFiat = (value) =>
	formatOrPlaceholder(value, FIAT_FRACTION_DIGITS);
