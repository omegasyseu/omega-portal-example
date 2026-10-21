// "€25" but "ORD 25": a symbol ending in a letter would run into the digits otherwise.
export const amountLabel = (symbol: string, amount: string) =>
	/\p{L}$/u.test(symbol) ? `${symbol} ${amount}` : `${symbol}${amount}`;
