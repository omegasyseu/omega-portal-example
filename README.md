# OMEGA Portal 5

Player-facing demo portal for the OMEGA platform. It shows off the player features the OMEGA backend already exposes: sign-up and login, payments (deposit/withdraw, or purchase/redeem on social brands), games, the player profile, responsible gaming, and the Engage products (challenges, quests, Level Up, leaderboards, jackpots, cashback) plus Chronos in-app notifications.

It talks to the backend directly from the browser: the player API (IPS) for almost everything, and AMS for game categories, leaderboards, quests and jackpot events.

## Tech stack

- React 19 + TypeScript 7, built with Vite 8
- [TanStack Router](https://tanstack.com/router) (file-based routes in `src/routes`; `src/routeTree.gen.ts` is generated, don't edit it)
- [TanStack Query](https://tanstack.com/query) for server state, [TanStack Table](https://tanstack.com/table) for tables
- [Mantine 9](https://mantine.dev) for UI, forms, modals and notifications
- axios for HTTP, zod 4 for response and form validation
- [Biome](https://biomejs.dev) for formatting and linting, [Vitest](https://vitest.dev) for unit tests

## Prerequisites

- **Node.js 24** and **pnpm 12** (`pnpm-lock.yaml` is the lockfile)

[mise](https://mise.jdx.dev) installs both from `mise.toml`: run `mise install` in the repo. Without mise, any Node 24 works, and `corepack pnpm` runs the pnpm version pinned in `package.json`.

## Getting started

```bash
git clone https://github.com/omegasyseu/omega-portal-example.git
cd omega-portal-example
pnpm install
cp .env.example .env   # then point the URLs at your environment
pnpm dev:all           # Strapi on this machine, seeded when empty, beside the portal
```

The portal reads each Brand's content from Strapi (`STRAPI_URL`), so it needs Strapi running beside it, which `pnpm dev:all` starts. Visitors pick a Brand in the header's switcher (locked to the player's own Brand while signed in), and a Payment Method shows only when IPS offers it and that Brand has it switched on. `pnpm dev:all` (`scripts/dev-all.ts`):

1. creates `strapi/.env` from `strapi/.env.example` with new random secrets, if it's missing (an existing one is left alone)
2. runs `pnpm install` in `strapi/` when `dev:all` hasn't installed it yet or `strapi/pnpm-lock.yaml` or `strapi/pnpm-workspace.yaml` changed since (the first install takes a minute or two)
3. starts Strapi on this machine (`pnpm run develop` in `strapi/`, no Docker) on http://localhost:1337, or the `PORT` in `strapi/.env`, with `IPS_API` from `.env` for the Brand list's **Refresh from IPS**, and waits until it answers; it stops if Strapi exits first, or after 10 minutes
4. seeds it if it's empty (`pnpm run seed --if-empty`), with every brand IPS lists (from `IPS_API`) and the seed's games; a Strapi that already has content is left alone
5. runs `pnpm dev` beside it

Both run in the one terminal, with every line prefixed `[strapi]` or `[portal]`. Ctrl+C, or either one stopping, stops both; `dev:all` then exits with a failure after Ctrl+C, or with the exit code of the one that stopped. A second Ctrl+C kills both at once. `dev:all` stops before starting anything when `.env` has no `IPS_API` or `STRAPI_URL` (the portal can't start without it). Strapi's content lives in `strapi/data/`; delete it, with Strapi stopped, to start again from a fresh seed. Deployed environments run Strapi inside the portal image instead (see [Deployment](#deployment)).

Strapi keeps its own `strapi/.env`, apart from the portal's `.env`, because the portal's dev server puts every value from its `.env` into the page it serves, where Strapi's secrets must never go.

Then register the first admin at http://localhost:1337/admin. Leave `STRAPI_URL` at `http://localhost:1337` (or Strapi's `PORT`) so the portal reads that Strapi; `dev:all` warns when it points elsewhere. Seeding a deployed environment is a deliberate step instead: see `strapi/README.md`.

The app runs on http://localhost:3000. When that port is taken, Vite picks the next free one and prints it; Strapi only accepts browser calls from `PORTAL_ORIGIN` in `strapi/.env`, so set that to match. (The image needs no `PORTAL_ORIGIN`: there the portal reads Strapi on its own origin.)

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the dev server on port 3000 |
| `pnpm dev:strapi` | Run only Strapi, on this machine in the foreground, on port 1337 (`pnpm --dir strapi develop`). It doesn't install: run `pnpm dev:all` once, or `pnpm install` in `strapi/`, first |
| `pnpm dev:all` | Install and start Strapi, seed it if it's empty, and run `dev` beside it: local development in one terminal |
| `pnpm build` | Type-check `src/` and `scripts/` (`tsc`, `tsconfig.scripts.json`) and build to `dist/` |
| `pnpm preview` | Serve the built `dist/` locally |
| `pnpm test` | Run the Vitest unit tests once (`pnpm test:watch` to watch) |
| `pnpm run ci` | Biome format + lint check of `src/` and `scripts/` (no writes) |
| `pnpm lint` | Biome lint only |
| `pnpm format` | Format `src/` and `scripts/` with Biome |
| `pnpm biome:check` | Format, lint and organise imports in `src/` and `scripts/`, applying safe fixes |
| `pnpm fix` | Run `format` then `biome:check` |

Use `pnpm run ci`, not `pnpm ci`: `pnpm ci` is pnpm's own clean-install command and never runs the script. `pnpm build`, `pnpm test` and `pnpm run ci` are the checks.

## Configuration

Settings come from two places. In both, values are injected per environment at deploy time, so one build serves every environment.

### Environment variables (`.env`)

Read through [vite-plugin-runtime](https://www.npmjs.com/package/vite-plugin-runtime). Locally they come from `.env`; for production builds `.env.production` sets `PORTAL_*` placeholders that are swapped for real values when the container starts.

| Variable | Purpose |
|---|---|
| `IPS_API` | Player API base URL, e.g. `https://ps.example.com/ps/ips` |
| `AMS_API` | AMS base URL, e.g. `https://core.example.com/ams` |
| `GAME_LAUNCH_BASE_URL` | Game container URL used to launch games |

### Runtime config (`public/runtime-config.js`)

Loaded by `index.html` as `window.RUNTIME_CONFIG`. Each value ships as a `PORTAL_*` placeholder; while it is still a placeholder (e.g. in local dev) the app falls back to the variable of the same name in `.env`.

| Key | Purpose | Default |
|---|---|---|
| `STRAPI_URL` | The environment's Strapi, without a trailing slash, e.g. `http://localhost:1337`, or `/strapi` in the image, where Strapi runs on the portal's own origin. Each Brand's Brand Theme, logo, lobby banners, games, Collections and Payment Methods come from it (see `strapi/README.md`); when it can't be reached the whole portal shows a plain error message, and when it isn't set the console says so too | none; required |
| `ENABLE_QUICK_SIGNUP_LINK` | Set to `false` to hide the quick sign-up link | on |
| `DATE_PATTERN` | The server's `date.pattern` registry, the Java pattern every IPS date comes back in, e.g. `MM-dd-yyyy HH:mm:ss`. Must match the server, or dates read wrong (an expiry of 12-31-2028 read day first rolls over to 2030). The date part is enough; the time is read as `HH:mm:ss`, so set `PORTAL_DATE_PATTERN=MM-dd-yyyy` in deployment, since `env.sh` splits values on spaces | `dd-MM-yyyy` |
| `CHRONOS_SOCKET_URL` | Chronos engine origin, e.g. `wss://chronos.example.com`. Empty disables Chronos notifications | empty |
| `CHRONOS_CHANNEL_IDS` | Comma-separated private channel ids to listen to. Empty = all private channels | empty |
| `CHRONOS_PUBLIC_CHANNEL_IDS` | Comma-separated public channel ids to listen to. Empty = none | empty |

`DATE_PATTERN` copies the IPS server's `date.pattern` registry, which is one value for the whole environment, so it stays a deployment setting rather than moving to Strapi: a copy edited in Strapi could drift from the server and misread every date. If it ever stops being a setting, the portal should read it from IPS.

## Deployment

The root `Dockerfile` builds one image holding the portal and the environment's Strapi (`strapi/`):

- a Node 24 stage runs `pnpm install --frozen-lockfile` and `pnpm build` (pnpm comes from corepack)
- a second Node 24 stage runs `pnpm install --frozen-lockfile` and a production `strapi build` in `strapi/`, then drops the dev dependencies
- the final image, on the same pinned Node 24 base with nginx added, serves `dist/` from `/usr/share/nginx/html` on port 3000 (`docker/nginx.conf`) and runs Strapi (`strapi start`, so the Content-Type Builder is read-only) on 127.0.0.1:1337. nginx proxies `/strapi/` to it: the API at `/strapi/api`, uploads at `/strapi/uploads` and the admin panel at `/strapi/admin`. The portal reads Strapi there, on its own origin, so the image sets `PORTAL_STRAPI_URL=/strapi` itself and needs no CORS

At container start `docker/entrypoint.sh` runs `docker/env.sh`, which replaces every `PORTAL_<NAME>` placeholder in the JS/CSS files and `runtime-config.js` with the value of the matching `PORTAL_<NAME>` environment variable:

```bash
PORTAL_IPS_API=https://ps.example.com/ps/ips
PORTAL_CHRONOS_SOCKET_URL=wss://chronos.example.com
```

It then starts Strapi and nginx. When either stops, the container exits and Docker's restart policy (`unless-stopped`) starts it again; `docker stop` stops both cleanly.

Strapi keeps its SQLite database, uploads and secrets in `/srv/strapi/data`, which must be a volume: losing it loses every edit made in that environment.

### Deploy an environment

`docker-compose.yml` is the deployment template, with one service:

1. Next to it, set `PORTAL5_IMAGE_TAG` in `.env`, and copy `portal.env.example` to `portal.env` with the environment's `PORTAL_*` values. Strapi's secrets need no setup: the first start makes them and saves them in the `strapi-data` volume (`/srv/strapi/data/secrets.env`), so a volume backup carries them too. To set one yourself, pass it in the environment; a value still containing `tobemodified` stops the container.
2. Start it: `docker compose up -d`. Strapi's content goes in the `strapi-data` volume.
3. Straight away, before you share the URL, register the first admin at `https://<portal>/strapi/admin`: whoever registers first becomes Strapi's super admin.
4. Seed the new, empty Strapi once (options in `strapi/README.md`). It reads IPS at the container's `PORTAL_IPS_API`:

   ```bash
   docker compose exec omega-portal5 npm run seed -- --theme=DARK
   ```

   A brand added in IPS later gets its Brand from **Refresh from IPS** on the admin's Brand list, which reads the same URL (see `strapi/README.md`).
5. Back up the `strapi-data` volume regularly, and keep the backups private: they hold Strapi's secrets as well as its content. With the container stopped, so SQLite is consistent:

   ```bash
   docker compose stop
   docker compose run --rm -T --no-deps --entrypoint tar omega-portal5 czf - -C /srv/strapi/data . > strapi-data-$(date +%F).tgz
   docker compose start
   ```

   `docker compose down -v` deletes the volume, so it deletes every Brand, Game and upload.

To try a local build: `docker build -t omegasystems/omega_portal5:local .`, then `PORTAL5_IMAGE_TAG=local docker compose up -d`.

## Project layout

```
src/
  routes/          File-based routes (pages). _auth, _authenticated, _payments… are layout groups
  components/      Feature components, grouped by feature (payments, profile, responsible-gaming…)
  server/          API calls and React Query hooks: IPS/ (player API), AMS/, STRAPI/ (per-Brand content), chronos/ (WebSocket)
  schemas-types/   zod schemas and types for API responses
  providers/       Authentication, selected currency account, the Selected Brand's content, Mantine theme
  layout/          Page shell (currency toggle, ticker, cashback redeem)
  ui/form-inputs/  Shared styled form inputs
  hooks/, utils/, constants/
public/            Static assets and runtime-config.js
docker/            nginx config and container start-up script
strapi/            Strapi for per-Brand content, its own pnpm project (see strapi/README.md)
```

`GLOSSARY.md` is the glossary for domain terms used in the code (e.g. Primary Account, RG Limit, Pending Limit).

[Game tile images](docs/game-tile-images.md) documents the 3:4 portrait ratio, recommended 960×1280 export size, text placement, and how to reuse existing artwork.

[Banner images](docs/banner-images.md) documents the quiet art style, source dimensions and text-safe composition for hero, promotion, sign-up and jackpot artwork.

## Conventions

- Call IPS through `IPS_AXIOS_CLIENT` (`src/server/IPS/IPS_CONFIG.ts`). It sends form-encoded requests, throws `IPSErrors` for any status other than `SUCCESS` or `CONTINUE_TO_PAYMENT_SITE`, and logs the player out on `NOT_LOGGED_IN_ERROR`.
- Read Strapi through `fetchStrapiOne` and `strapiQueryOptions` (`src/server/STRAPI/strapi-client.ts`). They prefix `STRAPI_URL`, check and parse the response, and keep it for the same five minutes.
- Wrap each endpoint in a React Query hook next to it under `src/server/`.
- Players can hold several currency accounts, each with its own `sessionKey`. Most calls use the login `sessionKey` (`useSession`); currency-specific calls such as payments and balances use the selected account's (`useGeneralInfo`); responsible gaming and Private Mode always use the primary account's (`usePrimaryAccount`).
- Run `pnpm fix` before committing, and make sure `pnpm build`, `pnpm test` and `pnpm run ci` pass.
