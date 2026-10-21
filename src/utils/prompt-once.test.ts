import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { forgetPrompts, rememberPrompted, wasPrompted } from "./prompt-once.ts";

const memoryStorage = () => {
	const items = new Map<string, string>();
	return {
		getItem: (key: string) => items.get(key) ?? null,
		setItem: (key: string, value: string) => items.set(key, value),
		removeItem: (key: string) => items.delete(key),
		key: (index: number) => [...items.keys()][index] ?? null,
		get length() {
			return items.size;
		},
	};
};

describe("prompt-once", () => {
	beforeEach(() => {
		vi.stubGlobal("sessionStorage", memoryStorage());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("remembers a prompt for the sign-in it was shown in", () => {
		rememberPrompted("kyc", "session-1");
		expect(wasPrompted("kyc", "session-1")).toBe(true);
	});

	it("prompts again after signing in again", () => {
		rememberPrompted("kyc", "session-1");
		expect(wasPrompted("kyc", "session-2")).toBe(false);
	});

	it("keeps each prompt separate", () => {
		rememberPrompted("registration", "session-1");
		expect(wasPrompted("kyc", "session-1")).toBe(false);
	});

	it("forgets every prompt on logout, leaving other storage alone", () => {
		rememberPrompted("registration", "session-1");
		rememberPrompted("kyc", "session-1");
		sessionStorage.setItem("other", "kept");

		forgetPrompts();

		expect(wasPrompted("registration", "session-1")).toBe(false);
		expect(wasPrompted("kyc", "session-1")).toBe(false);
		expect(sessionStorage.getItem("other")).toBe("kept");
	});

	it("treats blocked storage as never prompted", () => {
		vi.stubGlobal("sessionStorage", {
			getItem: () => {
				throw new Error("blocked");
			},
		});
		expect(wasPrompted("kyc", "session-1")).toBe(false);
	});
});
