// `pnpm dev:all`: creates strapi/.env with new secrets when it's missing, installs Strapi's
// packages when they're missing or stale, starts Strapi on this machine, waits until it
// answers, seeds it when it's empty (a no-op once it has content), then runs the portal's
// dev server beside it. Every line either prints is prefixed [strapi] or [portal]. Ctrl+C,
// or either one stopping, stops both. Run from the repo root; Node 24 runs this TypeScript
// file as it is.
import { type ChildProcess, spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import {
	devSettings,
	exitCodeOf,
	needsInstall,
	parseDotEnv,
	strapiEnvFrom,
} from "./dev-env.ts";

const STRAPI_DIR = "strapi";
const STRAPI_ENV = `${STRAPI_DIR}/.env`;
const STRAPI_ENV_EXAMPLE = `${STRAPI_ENV}.example`;
// What an install depends on: the lockfile, and pnpm-workspace.yaml's layout and allowed builds
const STRAPI_INSTALL_INPUTS = [
	`${STRAPI_DIR}/pnpm-lock.yaml`,
	`${STRAPI_DIR}/pnpm-workspace.yaml`,
];
// The hash of the install inputs dev:all last installed, written once the install succeeds.
const STRAPI_INSTALLED_LOCK = `${STRAPI_DIR}/node_modules/.dev-all-lock-sha256`;
// As strapi/README.md suggests: 16 random bytes, base64.
const SECRET_BYTES = 16;
const MS_PER_MINUTE = 60 * 1000;
// Strapi's first start builds its admin panel, which takes a minute or two.
const READY_TIMEOUT_MS = 10 * MS_PER_MINUTE;
const POLL_INTERVAL_MS = 3000;
const PROGRESS_EVERY_MS = 30 * 1000;
// How long a process gets to stop on SIGTERM before it's killed.
const STOP_TIMEOUT_MS = 10 * 1000;

type StartOptions = { cwd?: string; env?: NodeJS.ProcessEnv };

const running = new Set<ChildProcess>();
let isStopping = false;

// Each child runs in its own process group, so stopping it stops everything it started
// (Strapi's workers, vite) rather than only the pnpm in front.
const killGroup = (pid: number, signal: NodeJS.Signals) => {
	try {
		process.kill(-pid, signal);
	} catch (error) {
		// ESRCH: the group has already gone.
		if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
	}
};

const stop = (child: ChildProcess) =>
	new Promise<void>((resolve) => {
		const { pid } = child;
		// A child that never started (spawn's "error") has no pid and emits no exit.
		if (pid === undefined) return resolve();
		const forceKill = setTimeout(
			() => killGroup(pid, "SIGKILL"),
			STOP_TIMEOUT_MS,
		);
		// Once pnpm has exited, macOS refuses (EPERM) to signal what's left of its
		// group, so the forced kill is only for a child that ignores SIGTERM.
		child.once("exit", () => {
			clearTimeout(forceKill);
			resolve();
		});
		killGroup(pid, "SIGTERM");
	});

// Stops every running child, then exits. Later calls, such as a child's exit while it's
// being stopped, wait for the first.
const shutdown = async (exitCode: number): Promise<never> => {
	if (isStopping) return new Promise<never>(() => {});
	isStopping = true;
	await Promise.all([...running].map(stop));
	process.exit(exitCode);
};

const fail = (message: string): Promise<never> => {
	console.error(`dev:all: ${message}`);
	return shutdown(1);
};

const prefixLines = (
	input: NodeJS.ReadableStream,
	tag: string,
	isError: boolean,
) =>
	createInterface({ input }).on("line", (line) =>
		(isError ? console.error : console.log)(`[${tag}] ${line}`),
	);

const start = (
	tag: string,
	command: string,
	args: string[],
	options: StartOptions = {},
) => {
	const child = spawn(command, args, {
		...options,
		detached: true,
		stdio: ["ignore", "pipe", "pipe"],
	});
	running.add(child);
	child.on("exit", () => running.delete(child));
	child.on("error", (error) =>
		fail(`${command} couldn't start: ${error.message}`),
	);
	prefixLines(child.stdout, tag, false);
	prefixLines(child.stderr, tag, true);
	return child;
};

const exitOf = (child: ChildProcess) =>
	new Promise<number>((resolve) =>
		child.once("exit", (code, signal) => resolve(exitCodeOf(code, signal))),
	);

// Runs a step to its end, and stops dev:all when it fails.
const runStep = async (
	tag: string,
	command: string,
	args: string[],
	options: StartOptions = {},
) => {
	const code = await exitOf(start(tag, command, args, options));
	if (code !== 0 && !isStopping) {
		await fail(`${command} ${args.join(" ")} exited with ${code}.`);
	}
};

const isStrapiUp = async (strapiUrl: string) => {
	try {
		return (await fetch(`${strapiUrl}/_health`)).ok;
	} catch {
		return false;
	}
};

// Strapi dying while dev:all waits stops dev:all through Strapi's exit listener.
const waitForStrapi = async (strapiUrl: string) => {
	const startedAt = Date.now();
	let lastProgressAt = startedAt;
	console.log(`dev:all: waiting for Strapi on ${strapiUrl} ...`);
	while (!(await isStrapiUp(strapiUrl))) {
		const now = Date.now();
		if (now - startedAt > READY_TIMEOUT_MS) {
			await fail(
				`Strapi didn't answer within ${READY_TIMEOUT_MS / MS_PER_MINUTE} minutes. See its [strapi] output above.`,
			);
		}
		if (now - lastProgressAt >= PROGRESS_EVERY_MS) {
			console.log(
				`dev:all: still waiting for Strapi (${Math.round((now - startedAt) / 1000)}s; the first start builds its admin panel).`,
			);
			lastProgressAt = now;
		}
		await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
	}
};

// A first local start gets its own Strapi secrets; deployed environments set theirs.
const createStrapiEnv = async () => {
	if (!existsSync(STRAPI_ENV_EXAMPLE)) {
		await fail(
			`${STRAPI_ENV_EXAMPLE} is missing, so ${STRAPI_ENV} can't be made. Restore it from git.`,
		);
	}
	const example = readFileSync(STRAPI_ENV_EXAMPLE, "utf8");
	const newSecret = () => randomBytes(SECRET_BYTES).toString("base64");
	writeFileSync(STRAPI_ENV, strapiEnvFrom(example, newSecret), { mode: 0o600 });
	console.log(
		`dev:all: created ${STRAPI_ENV} from ${STRAPI_ENV_EXAMPLE}, with new random secrets.`,
	);
};

const installStrapiIfNeeded = async () => {
	const lock = STRAPI_INSTALL_INPUTS.reduce(
		(hash, file) => hash.update(readFileSync(file)),
		createHash("sha256"),
	).digest("hex");
	const installedLock = existsSync(STRAPI_INSTALLED_LOCK)
		? readFileSync(STRAPI_INSTALLED_LOCK, "utf8")
		: undefined;
	if (!needsInstall(installedLock, lock)) return;
	console.log(
		`dev:all: installing Strapi's packages (pnpm install in ${STRAPI_DIR}/); the first install takes a minute or two.`,
	);
	await runStep("strapi", "pnpm", ["install", "--frozen-lockfile"], {
		cwd: STRAPI_DIR,
	});
	// A failed install has stopped dev:all; one cut short by Ctrl+C is not recorded.
	if (!isStopping) writeFileSync(STRAPI_INSTALLED_LOCK, lock);
};

// Exits the way the process that stopped dev:all did, after stopping the other one.
const stopAllWhenItExits = (
	child: ChildProcess,
	name: string,
	isReady: () => boolean,
) =>
	child.once("exit", (code, signal) => {
		if (isStopping) return;
		const exitCode = exitCodeOf(code, signal);
		console.error(
			isReady()
				? `dev:all: ${name} stopped (exit ${exitCode}), so dev:all stops everything.`
				: `dev:all: ${name} stopped (exit ${exitCode}) before it answered. See its [strapi] output above.`,
		);
		shutdown(exitCode);
	});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
	process.on(signal, () => {
		const exitCode = exitCodeOf(null, signal);
		if (!isStopping) return shutdown(exitCode);
		// A second Ctrl+C doesn't wait for a slow stop.
		for (const { pid } of running) if (pid) killGroup(pid, "SIGKILL");
		process.exit(exitCode);
	});
}

if (!existsSync(".env")) {
	await fail(
		".env is missing: copy .env.example and point it at your environment.",
	);
}
if (!existsSync(STRAPI_ENV)) {
	await createStrapiEnv();
}
const settings = await (async () => {
	try {
		return devSettings(
			parseDotEnv(readFileSync(".env", "utf8")),
			parseDotEnv(readFileSync(STRAPI_ENV, "utf8")),
		);
	} catch (error) {
		return fail((error as Error).message);
	}
})();
if (!settings.readsLocalStrapi) {
	console.warn(
		`dev:all: STRAPI_URL in .env isn't ${settings.strapiUrl}, so the portal won't read the Strapi this starts and seeds.`,
	);
}

await installStrapiIfNeeded();
let isStrapiReady = false;
// Strapi reads IPS too, for the Brand list's "Refresh from IPS".
const ipsEnv = { ...process.env, IPS_API: settings.ipsUrl };
const strapi = start("strapi", "pnpm", ["run", "develop"], {
	cwd: STRAPI_DIR,
	env: ipsEnv,
});
stopAllWhenItExits(strapi, "Strapi", () => isStrapiReady);
await waitForStrapi(settings.strapiUrl);
isStrapiReady = true;
await runStep("strapi", "pnpm", ["run", "seed", "--if-empty"], {
	cwd: STRAPI_DIR,
	env: ipsEnv,
});
const portal = start("portal", "pnpm", ["dev"]);
stopAllWhenItExits(portal, "The portal", () => true);
