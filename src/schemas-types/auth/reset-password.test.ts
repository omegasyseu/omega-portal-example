import { describe, expect, it } from "vitest";
import { z } from "zod";
import { resetPasswordFrontSchema } from "@/schemas-types/auth/reset-password";

const keyError = (resetPasswordKey: string) => {
	const result = resetPasswordFrontSchema(z.string()).safeParse({
		resetPasswordKey,
		newPassword: "Omega123!",
	});
	return result.success
		? null
		: (result.error.issues.find((issue) => issue.path[0] === "resetPasswordKey")
				?.message ?? null);
};

describe("resetPasswordFrontSchema", () => {
	it("asks for the emailed code until at least 4 digits are entered", () => {
		expect(keyError("")).toBe("Please enter a valid code");
		expect(keyError("482")).toBe("Please enter a valid code");
	});

	it("accepts a code of the length the brand sends", () => {
		expect(keyError("4821")).toBeNull();
		expect(keyError("48291637")).toBeNull();
	});
});
