// The settings `pnpm dev:all` takes from the portal's .env and strapi/.env (see
// scripts/dev-all.ts).
import { constants } from "node:os";
import { withoutTrailingSlash } from "../src/utils/without-trailing-slash.ts";

// Strapi's port when strapi/.env sets no PORT, as Strapi's own config defaults.
const DEFAULT_STRAPI_PORT = "1337";

export type DevSettings = {
	ipsUrl: string;
	// The Strapi dev:all starts, on the PORT from strapi/.env.
	strapiUrl: string;
	// Whether the portal's STRAPI_URL is the Strapi dev:all starts and seeds.
	readsLocalStrapi: boolean;
};

const QUOTED = /^(["'])(.*)\1$/;

/** The KEY=value lines of a .env file; blank lines and # comments are skipped. */
export const parseDotEnv = (text: string): Record<string, string> =>
	Object.fromEntries(
		text
			.split("\n")
			.map((line) => line.trim())
			.filter(
				(line) => line !== "" && !line.startsWith("#") && line.includes("="),
			)
			.map((line) => {
				const at = line.indexOf("=");
				const value = line.slice(at + 1).trim();
				return [line.slice(0, at).trim(), value.replace(QUOTED, "$2")];
			}),
	);

// strapi/.env.example's placeholder for each secret ("tobemodified", "tobemodified1", ...).
const PLACEHOLDER = /tobemodified\d*/g;

/**
 * A local strapi/.env made from strapi/.env.example: every placeholder in a setting gets
 * its own secret from `newSecret`, and every other line is kept as it is.
 */
export const strapiEnvFrom = (
	example: string,
	newSecret: () => string,
): string =>
	example
		.split("\n")
		.map((line) =>
			line.trimStart().startsWith("#")
				? line
				: line.replace(PLACEHOLDER, () => newSecret()),
		)
		.join("\n");

// A shell's exit status for a process ended by a signal is 128 plus the signal's number.
const SIGNAL_EXIT_BASE = 128;

/** The exit code dev:all passes on for a child that exited with `code` or by `signal`. */
export const exitCodeOf = (
	code: number | null,
	signal: NodeJS.Signals | null,
): number =>
	signal ? SIGNAL_EXIT_BASE + constants.signals[signal] : (code ?? 1);

/**
 * Whether strapi/ needs `pnpm install`: dev:all never installed it, or the content of
 * pnpm-lock.yaml or pnpm-workspace.yaml changed since. Both are those files' hash; `installedLock` is undefined when
 * dev:all has no install recorded. Content, not modified time, so a checkout that only
 * touches them doesn't reinstall and an older-dated change isn't missed.
 */
export const needsInstall = (
	installedLock: string | undefined,
	lock: string,
): boolean => installedLock !== lock;

/**
 * What dev:all needs from the portal's .env and strapi/.env: IPS's URL for the seed, the
 * local Strapi's URL, and whether the portal will read that Strapi. Throws without IPS's
 * URL, and without STRAPI_URL, which the portal can't start without.
 */
export const devSettings = (
	env: Record<string, string | undefined>,
	strapiEnv: Record<string, string | undefined> = {},
): DevSettings => {
	const ipsUrl = withoutTrailingSlash(env.IPS_API ?? "");
	if (!ipsUrl) {
		throw new Error(
			"Set IPS_API in .env (e.g. https://ps.example.com/ps/ips): the seed reads IPS's brands.",
		);
	}
	const strapiUrl = `http://localhost:${strapiEnv.PORT || DEFAULT_STRAPI_PORT}`;
	const portalStrapiUrl = withoutTrailingSlash(env.STRAPI_URL ?? "");
	if (!portalStrapiUrl) {
		throw new Error(
			`Set STRAPI_URL in .env (${strapiUrl} for the Strapi dev:all starts): the portal can't start without it.`,
		);
	}
	return {
		ipsUrl,
		strapiUrl,
		readsLocalStrapi: portalStrapiUrl === strapiUrl,
	};
};
