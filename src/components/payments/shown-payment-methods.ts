import type { PaymentMethodSettings } from "@/providers/brand-content/brand-content.ts";

export type PaymentDirection = "deposit" | "withdrawal";

// How a shown method is displayed: the Brand's name for it, and its logo (undefined for
// none).
export type PaymentMethodDisplay = {
	name: string;
	logoUrl: string | undefined;
};

// One of IPS's methods for the player, as the Brand shows it.
export type ShownPaymentMethod<M> = PaymentMethodDisplay & { method: M };

// How the Brand displays a method in that direction; undefined when the Brand hides it,
// as it does any method Strapi doesn't list.
const brandDisplay = (
	code: string,
	settings: PaymentMethodSettings,
	direction: PaymentDirection,
): PaymentMethodDisplay | undefined => {
	const setting = settings.get(code);
	if (!setting?.[direction]) return undefined;
	return { name: setting.name, logoUrl: setting.logoUrl };
};

// How a method is displayed when it's shown: offered by IPS for the player
// (`offeredCodes`) and switched on by the Brand for that direction. Undefined when it
// isn't shown.
export const shownPaymentMethod = (
	code: string,
	offeredCodes: readonly string[],
	settings: PaymentMethodSettings,
	direction: PaymentDirection,
): PaymentMethodDisplay | undefined =>
	offeredCodes.includes(code)
		? brandDisplay(code, settings, direction)
		: undefined;

// The methods to show: those IPS offers the player that the Brand switched on for that
// direction, in IPS's order, which puts the recommended one first.
export const shownPaymentMethods = <M extends { code: string }>(
	offered: readonly M[],
	settings: PaymentMethodSettings,
	direction: PaymentDirection,
): ShownPaymentMethod<M>[] =>
	offered.flatMap((method) => {
		const display = brandDisplay(method.code, settings, direction);
		return display ? [{ ...display, method }] : [];
	});
