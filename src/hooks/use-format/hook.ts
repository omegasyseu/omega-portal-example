import { useCallback } from "react";

import {
	type FormatCurrency,
	type FormatCurrencySymbol,
	type FormatNumByCurrency,
	formatCurrency,
	formatNumByCurrency,
	getCurrencyFromMap,
	getCurrencySymbol,
} from "@/hooks/use-format/fomatCurrencySymbol";
import { type FormatFiat, formatFiat as formatFiatFn } from "./formatFiat";
import {
	type FormatNumber,
	formatNumber as formatNumberFn,
} from "./formatNumber";

export const useFormat = () => {
	const formatFiat = useCallback<FormatFiat>(
		(value) => formatFiatFn(value),
		[],
	);
	const formatNumber = useCallback<FormatNumber>(
		(value) => formatNumberFn(value),
		[],
	);
	const formatCurrencySymbol = useCallback<FormatCurrencySymbol>(
		(currency) => getCurrencySymbol(currency),
		[],
	);

	const formatCurrencyFromMap = useCallback<FormatCurrencySymbol>(
		(currency) => getCurrencyFromMap(currency),
		[],
	);

	const formatCurrencyFn = useCallback<FormatCurrency>(
		(value, currencyInfo) => formatCurrency(value, currencyInfo),
		[],
	);

	const formatNumByCurrencyFn = useCallback<FormatNumByCurrency>(
		(value, currency) => formatNumByCurrency(value, currency),
		[],
	);

	return {
		formatNumber,
		formatCurrencyFromMap,
		formatCurrencySymbol,
		formatCurrencyFn,
		formatNumByCurrencyFn,
		formatFiat,
	};
};
