import { describe, expect, it } from "vitest";
import { authSearchSchema, authStepForPath } from "./auth-steps";

describe("authStepForPath", () => {
	it.each([
		["/login", "login"],
		["/signup", "signup"],
		["/signup/code", "signup-code"],
		["/quick-signup", "quick-signup"],
		["/quick-signup/code/", "quick-signup-code"],
		["/forgot-password", "forgot-password"],
		["/forgot-password/reset", "reset-password"],
		["/LOGIN", "login"],
	])("opens %s's old URL as the %s step", (pathname, step) => {
		expect(authStepForPath(pathname)).toBe(step);
	});

	it("falls back to sign-in for an unknown page in the flow", () => {
		expect(authStepForPath("/signup/other")).toBe("login");
	});
});

describe("authSearchSchema", () => {
	it("reads the step and the values the steps pass on", () => {
		expect(
			authSearchSchema.parse({
				auth: "signup-code",
				redirect: "/deposit",
				username: "player1",
			}),
		).toEqual({
			auth: "signup-code",
			redirect: "/deposit",
			username: "player1",
		});
	});

	it("ignores a step that doesn't exist", () => {
		expect(authSearchSchema.parse({ auth: "admin" }).auth).toBeUndefined();
	});
});
