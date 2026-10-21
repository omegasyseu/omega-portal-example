import { describe, expect, it } from "vitest";
import {
	devSettings,
	exitCodeOf,
	needsInstall,
	parseDotEnv,
	strapiEnvFrom,
} from "./dev-env.ts";

describe("exitCodeOf", () => {
	it("passes on the exit code of a process that exited", () => {
		expect(exitCodeOf(0, null)).toBe(0);
		expect(exitCodeOf(2, null)).toBe(2);
	});

	it("gives a process ended by a signal a shell's 128 + signal number", () => {
		expect(exitCodeOf(null, "SIGINT")).toBe(130);
		expect(exitCodeOf(null, "SIGKILL")).toBe(137);
	});
});

describe("needsInstall", () => {
	it("installs when dev:all has never installed strapi/", () => {
		expect(needsInstall(undefined, "abc")).toBe(true);
	});

	it("installs when pnpm-lock.yaml's content changed since the last install", () => {
		expect(needsInstall("def", "abc")).toBe(true);
	});

	it("skips the install when pnpm-lock.yaml is as it was, whatever its modified time", () => {
		expect(needsInstall("abc", "abc")).toBe(false);
	});
});

describe("strapiEnvFrom", () => {
	const example = [
		'# Copy to .env and replace every "tobemodified" with a random value.',
		"PORT=1337",
		"PORTAL_ORIGIN=http://localhost:3000",
		'APP_KEYS="tobemodified1,tobemodified2"',
		"ADMIN_JWT_SECRET=tobemodified",
		"",
	].join("\n");
	const counter = () => {
		let count = 0;
		return () => `secret${++count}`;
	};

	it("gives every placeholder its own new secret", () => {
		const env = parseDotEnv(strapiEnvFrom(example, counter()));
		expect(env.APP_KEYS).toBe("secret1,secret2");
		expect(env.ADMIN_JWT_SECRET).toBe("secret3");
	});

	it("keeps every other setting and the comments as the example has them", () => {
		const text = strapiEnvFrom(example, counter());
		expect(parseDotEnv(text).PORTAL_ORIGIN).toBe("http://localhost:3000");
		expect(parseDotEnv(text).PORT).toBe("1337");
		expect(text.split("\n")[0]).toBe(example.split("\n")[0]);
		expect(text.endsWith("\n")).toBe(true);
	});

	it("leaves no placeholder in a setting", () => {
		const settings = strapiEnvFrom(example, counter())
			.split("\n")
			.filter((line) => !line.startsWith("#"));
		expect(settings.join("\n")).not.toMatch(/tobemodified/);
	});
});

describe("parseDotEnv", () => {
	it("reads KEY=value lines and skips blanks and comments", () => {
		expect(
			parseDotEnv(
				"# a comment\nIPS_API=https://ips.example/ps/ips\n\n  DATE_PATTERN = dd-MM-yyyy \n",
			),
		).toEqual({
			IPS_API: "https://ips.example/ps/ips",
			DATE_PATTERN: "dd-MM-yyyy",
		});
	});

	it("keeps everything after the first = and strips surrounding quotes", () => {
		expect(
			parseDotEnv(
				"DATE_PATTERN=\"MM-dd-yyyy HH:mm:ss\"\nKEYS='a=b'\nEMPTY=\nURL=https://x.example/?a=1",
			),
		).toEqual({
			DATE_PATTERN: "MM-dd-yyyy HH:mm:ss",
			KEYS: "a=b",
			EMPTY: "",
			URL: "https://x.example/?a=1",
		});
	});
});

describe("devSettings", () => {
	const env = {
		IPS_API: "https://ips.example/ps/ips/",
		STRAPI_URL: "http://localhost:1337",
	};

	it("needs only IPS's URL and STRAPI_URL, whatever else .env holds", () => {
		expect(devSettings({ ...env, DATE_PATTERN: "dd-MM-yyyy" })).toEqual({
			ipsUrl: "https://ips.example/ps/ips",
			strapiUrl: "http://localhost:1337",
			readsLocalStrapi: true,
		});
	});

	it("passes IPS's URL on without a trailing slash", () => {
		expect(devSettings(env).ipsUrl).toBe("https://ips.example/ps/ips");
	});

	it("needs IPS's URL, since the seed reads IPS's brands", () => {
		expect(() => devSettings({ STRAPI_URL: env.STRAPI_URL })).toThrow(
			/IPS_API/,
		);
		expect(() => devSettings({ ...env, IPS_API: " " })).toThrow(/IPS_API/);
	});

	it("accepts an IPS on this machine, since the seed runs on the host", () => {
		expect(
			devSettings({ ...env, IPS_API: "http://localhost:8080/ps/ips" }).ipsUrl,
		).toBe("http://localhost:8080/ps/ips");
	});

	it("needs STRAPI_URL, since the portal can't start without it", () => {
		const { STRAPI_URL: _absent, ...withoutStrapiUrl } = env;
		expect(() => devSettings(withoutStrapiUrl)).toThrow(/STRAPI_URL/);
		expect(() => devSettings({ ...env, STRAPI_URL: "" })).toThrow(/STRAPI_URL/);
	});

	it("notices when the portal reads a Strapi other than the one dev:all starts", () => {
		expect(devSettings(env).readsLocalStrapi).toBe(true);
		expect(
			devSettings({ ...env, STRAPI_URL: "http://localhost:1337/" })
				.readsLocalStrapi,
		).toBe(true);
		expect(
			devSettings({ ...env, STRAPI_URL: "http://localhost:1338" })
				.readsLocalStrapi,
		).toBe(false);
	});

	it("finds the local Strapi on the PORT strapi/.env sets", () => {
		const settings = devSettings(
			{ ...env, STRAPI_URL: "http://localhost:1437" },
			{ PORT: "1437" },
		);
		expect(settings.strapiUrl).toBe("http://localhost:1437");
		expect(settings.readsLocalStrapi).toBe(true);
		expect(devSettings(env, { PORT: "1437" }).readsLocalStrapi).toBe(false);
	});
});
