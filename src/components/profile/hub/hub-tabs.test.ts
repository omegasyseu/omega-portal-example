import { describe, expect, it } from "vitest";
import { HUB_TABS, hubTabFor } from "@/components/profile/hub/hub-tabs.ts";

describe("HUB_TABS", () => {
	it("lists the profile hub's five tabs in order", () => {
		expect(HUB_TABS.map((tab) => [tab.label, tab.to])).toEqual([
			["General info", "/profile"],
			["Kyc", "/upload-documents"],
			["Responsible Gaming", "/responsible-gaming"],
			["Game history", "/gaming-history"],
			["Transaction history", "/transaction-history"],
		]);
	});
});

describe("hubTabFor", () => {
	it("selects the tab whose URL is open", () => {
		expect(hubTabFor("/upload-documents")).toBe("kyc");
		expect(hubTabFor("/gaming-history")).toBe("game-history");
	});

	it("opens General info from the old profile, password and preferences URLs", () => {
		expect(hubTabFor("/profile")).toBe("general");
		expect(hubTabFor("/change-password")).toBe("general");
		expect(hubTabFor("/contact-preferences")).toBe("general");
	});

	it("ignores a trailing slash", () => {
		expect(hubTabFor("/responsible-gaming/")).toBe("responsible-gaming");
	});

	it("selects no tab outside the hub", () => {
		expect(hubTabFor("/refer-a-friend")).toBeUndefined();
	});
});
