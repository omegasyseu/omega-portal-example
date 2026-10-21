import { describe, expect, it } from "vitest";
import { resendLabel, secondsUntilResend } from "./resend-cooldown";

const SENT_AT = 1_000_000;

describe("secondsUntilResend", () => {
	it("waits 30 seconds from when the code was sent", () => {
		expect(secondsUntilResend(SENT_AT, SENT_AT)).toBe(30);
		expect(secondsUntilResend(SENT_AT, SENT_AT + 29_500)).toBe(1);
		expect(secondsUntilResend(SENT_AT, SENT_AT + 30_000)).toBe(0);
	});

	it("counts real time, so a page left in the background catches up", () => {
		expect(secondsUntilResend(SENT_AT, SENT_AT + 60_000)).toBe(0);
		expect(secondsUntilResend(SENT_AT, SENT_AT + 12_000)).toBe(18);
	});
});

describe("resendLabel", () => {
	it("says how long is left, then offers to resend", () => {
		expect(resendLabel(30)).toBe("Resend in 30s");
		expect(resendLabel(1)).toBe("Resend in 1s");
		expect(resendLabel(0)).toBe("Resend code");
	});
});
