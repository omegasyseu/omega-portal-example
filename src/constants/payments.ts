// IPS's codes for the Payment Methods the portal has flows for. Strapi's starter Payment
// Methods (strapi/seed/payment-methods.json) are all of these but PAYCOM, under the same
// codes; change them together.
export const PAYMENT_METHOD_CODE = {
	OMEGA_BANK: "OMEGA_BANK",
	EVOUCHER: "EVOUCHER",
	PAYMENTIQ_ALL: "PAYMENTIQ_ALL",
	COINSPAID_V2: "COINSPAID_V2",
	PAYCOM: "PAYCOM",
} as const;

export const getPaymentProviderNotes = (code: string): string => {
	const notes: { [key: string]: string } = {
		[PAYMENT_METHOD_CODE.PAYCOM]:
			"Requires existing payment information. Make a successful deposit to save existing payment information.",
	};
	return notes[code] || "";
};

export enum PAYMENT_TYPE {
	DEFAULT = "DEFAULT",
	CREDIT_CARD = "CREDIT_CARD",
	BANK = "BANK",
}

// Withdrawal methods the portal supports. `canSelectSavedPaymentInformation` shows the
// saved payment information picker on the method's withdrawal form.
export const SUPPORTED_WITHDRAWAL_METHODS = [
	{
		code: PAYMENT_METHOD_CODE.OMEGA_BANK,
		type: PAYMENT_TYPE.BANK,
		canSelectSavedPaymentInformation: false,
	},
	{
		code: PAYMENT_METHOD_CODE.PAYCOM,
		type: PAYMENT_TYPE.CREDIT_CARD,
		canSelectSavedPaymentInformation: true,
	},
] as const;

export const getSupportedWithdrawalMethod = (code: string) =>
	SUPPORTED_WITHDRAWAL_METHODS.find((method) => method.code === code);
