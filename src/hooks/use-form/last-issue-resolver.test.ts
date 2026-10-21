import { describe, expect, it } from "vitest";
import { z } from "zod";
import { lastIssueResolver } from "@/hooks/use-form/last-issue-resolver";
import { country } from "@/schemas-types/auth/signup";
import { changePasswordSchema } from "@/schemas-types/profile/update-password";

describe("lastIssueResolver", () => {
	it("returns no errors for valid values", () => {
		const resolve = lastIssueResolver(z.object({ country }));
		expect(resolve({ country: "Malta" })).toEqual({});
	});

	it("shows a field's last issue when it has several", () => {
		const resolve = lastIssueResolver(z.object({ country }));
		expect(resolve({ country: "" })).toEqual({
			country: "Country must be at least 2 characters",
		});
	});

	it("shows a cross-field rule over a field's own issue", () => {
		// "abc" is too short as well as the same as the old one.
		const resolve = lastIssueResolver(
			changePasswordSchema(z.string().min(6, "Too short")),
		);
		expect(
			resolve({ password: "abc", newPassword: "abc", confirmPassword: "abc" }),
		).toEqual({
			newPassword: "New password cannot be the same as old password",
		});
	});

	it("keys nested fields by their dotted path", () => {
		const resolve = lastIssueResolver(
			z.object({ emails: z.array(z.string().email("Invalid email")) }),
		);
		expect(resolve({ emails: ["a@b.co", "nope"] })).toEqual({
			"emails.1": "Invalid email",
		});
	});
});
