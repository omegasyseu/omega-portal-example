// A brand sets how many digits its codes have (the verification.code.digit registry,
// 4 or 6 today), so the field takes any length up to this.
export const CODE_MAX_LENGTH = 10;

// What the player typed or pasted, as the code's digits.
export const codeDigits = (value: string) =>
	value.replace(/\D/g, "").slice(0, CODE_MAX_LENGTH);
