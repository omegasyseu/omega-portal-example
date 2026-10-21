import { afterEach, describe, expect, it, vi } from "vitest";
import { getStrapiUrl } from "@/server/config.ts";

const runtimeConfig = (STRAPI_URL: string) =>
	vi.stubGlobal("window", { RUNTIME_CONFIG: { STRAPI_URL } });

describe("getStrapiUrl", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.unstubAllEnvs();
	});

	it("reads the environment's Strapi without a trailing slash", () => {
		runtimeConfig("https://strapi.example.com/");
		expect(getStrapiUrl()).toBe("https://strapi.example.com");
	});

	it("fails with a clear message when STRAPI_URL isn't set, rather than asking the portal itself", () => {
		vi.stubEnv("STRAPI_URL", "");
		// A container started without it keeps the build's placeholder.
		runtimeConfig("PORTAL_STRAPI_URL");
		expect(() => getStrapiUrl()).toThrow(/STRAPI_URL is not set/);
	});
});
