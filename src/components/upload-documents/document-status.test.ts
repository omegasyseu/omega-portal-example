import { describe, expect, it } from "vitest";
import { documentStatusBadge } from "./document-status.ts";

describe("documentStatusBadge", () => {
	it("shows an approved document as approved, in the success colour", () => {
		expect(documentStatusBadge("APPROVED")).toEqual({
			color: "neon",
			label: "Approved",
		});
	});

	it("asks the player to upload a declined document again", () => {
		expect(documentStatusBadge("DECLINED")).toEqual({
			color: "danger",
			label: "Declined, please upload again",
		});
	});

	it("shows a document being checked as verifying", () => {
		expect(documentStatusBadge("VERIFYING")).toEqual({
			color: "gold",
			label: "Verifying",
		});
	});

	it("shows any other status in a neutral colour, in sentence case", () => {
		// The ladder, not one shade of it: a light badge in "dark.2" fills with that grey and
		// can't be read in either Colour Mode.
		expect(documentStatusBadge("NOT_REVIEWED")).toEqual({
			color: "dark",
			label: "Not reviewed",
		});
	});
});
