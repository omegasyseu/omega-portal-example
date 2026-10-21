// The phone field's value on its way in: IPS stores numbers without their "+", and the
// phone input reads E.164 ("+14165550193").
export const phoneForInput = (value: string | null | undefined) => {
	if (!value) return "";
	return value.startsWith("+") ? value : `+${value}`;
};

// And on its way out: the country's dial code on its own is no number at all. A field
// cleared down to its "+" stays as typed; as "" the input would put the old country's
// dial code back while the player types a new one. Validation refuses a bare "+".
export const phoneForForm = (phone: string, dialCode: string) =>
	phone === `+${dialCode}` ? "" : phone;
