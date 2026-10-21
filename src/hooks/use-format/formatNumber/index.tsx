import { formatOrPlaceholder } from "../format-decimal";

const WHOLE_NUMBER_FRACTION_DIGITS = 0;

export type FormatNumber = (value: string | number) => string;

export const formatNumber: FormatNumber = (value) =>
	formatOrPlaceholder(value, WHOLE_NUMBER_FRACTION_DIGITS);
