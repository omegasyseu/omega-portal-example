# Strapi for portal content

Strapi 5 (TypeScript) holding each **Brand**'s content for the portal: its Brand Theme, logo, banners, lobby, the Collections it shows, how it shows each Payment Method and its Legal Pages, plus the games, Collections and Payment Methods every Brand picks from. Each environment runs its own Strapi next to the portal. The portal reads published content through the public REST API.

This folder is its own pnpm project, with its own `pnpm-lock.yaml` and `pnpm-workspace.yaml` (a flat `node_modules`, as Strapi expects, and the install scripts it may run). It is not part of the portal's pnpm workspace, so `pnpm install` at the repo root doesn't install Strapi, and Biome doesn't check this folder.

## Start it

For local development Strapi runs on your machine, like the portal, with no Docker. You need Node 24 (`mise install` at the repo root). Run `pnpm dev:all` from the repo root: it creates `.env` here with new random secrets when it's missing, runs `pnpm install` here when it hasn't installed it yet or `pnpm-lock.yaml` or `pnpm-workspace.yaml` changed since, starts Strapi, seeds it when it's empty and starts the portal, all in one terminal. To run only Strapi, in the foreground, use `pnpm dev:strapi` at the root, or by hand:

```bash
cd strapi
cp .env.example .env   # then replace every "tobemodified" with a random value
pnpm install
pnpm run develop
```

`pnpm dev:strapi` doesn't install, so run `pnpm install` here (or `pnpm dev:all` once) after `pnpm-lock.yaml` or `pnpm-workspace.yaml` changes. Strapi is ready when the log says `Strapi started successfully`. It listens on http://localhost:1337, or the `PORT` in `.env`. The content lives in `data/` here; to reset it, stop Strapi and delete `data/`, and the next `pnpm dev:all` seeds it afresh.

`pnpm test` and `pnpm exec tsc --noEmit` run here, on the host.

### In the portal image, for deployed environments

Deployed environments run this Strapi inside the portal image (`omegasystems/omega_portal5`), built by the repo's root `Dockerfile` and run with the root `docker-compose.yml`; see the portal's README, "Deployment". There:

- nginx serves Strapi at `/strapi` on the portal's own origin: the API at `/strapi/api`, uploads at `/strapi/uploads` and the admin panel at `/strapi/admin`. The admin is built for that path (`PUBLIC_URL=/strapi`, see `config/server.ts`); nginx strips `/strapi`, so Strapi itself runs at its root, on 127.0.0.1:1337 inside the container
- it runs `strapi start`, in production, so the Content-Type Builder is read-only. Change content types here, with `pnpm run develop`, and ship them in a new image
- its content is in `/srv/strapi/data`, the `strapi-data` volume
- its secrets are made on the first start and kept in the data volume (`/srv/strapi/data/secrets.env`); one set in the container's environment wins. `PORTAL_ORIGIN` isn't needed, since the portal is on the same origin

### Why not the `naskio/strapi` community image

The first plan used `naskio/strapi`. Its newest tag (5.30.1, November 2025) runs Node 18, which Strapi 5 no longer supports (Strapi 5.57 needs Node 20 to 26; the docs list 22, 24 and 26). It's built for amd64 only, its entrypoint installs production dependencies only (so no TypeScript), and it starts the image's own global Strapi instead of this project's. The portal image builds this project instead, on the same pinned Node 24 as the portal.

## Create the first admin

Open http://localhost:1337/admin (in the portal image, `/strapi/admin` on the portal's address). On a new database Strapi asks you to register the first administrator. Every environment has its own admins; invite more in **Settings → Users**.

## Seed a new environment

A new Strapi is empty, so the portal would show no lobby. The one-off seed fills it with the content the portal had before Strapi, so nothing changes visually:

- the 42 Games that start the Game Catalogue, published, each with its tile image
- two published Collections, "Slots" (slug `slots`) and "Sports" (slug `sports`), both with the dice icon
- one published Brand per brand IPS lists (`/getBrands`), each with:
  - the Brand Theme you choose
  - the logo for that theme: the OMEGA Systems logo for `DARK`, the Kambi logo for `LIGHT`. A Brand has one logo, shown in both its header and footer, so the operator uploads whichever logo suits the Brand's theme
  - the three lobby banners (leaderboard, jackpot and promotions)
  - a lobby of every seeded Game, in the old order
  - the Slots and Sports Collections, ordered as their categories first appear in the lobby, each holding its category's games in lobby order. The portal's menu and tabs therefore look as they did when they were built from categories
  - all four Payment Methods (below), each switched on for deposits and withdrawals, with no name or logo of the Brand's own
  - all five Legal Pages (Gaming Rules, Player Protection Information, Terms and Conditions, Privacy Policy, and Complaints and Contact) from `seed/legal/`, with the Brand's IPS name in place of `{{brand}}` and no `updatedOn`. They're jurisdiction-neutral starter text, which editors change for each environment; the Terms and Conditions still say "THIS IS NOT A REAL MONEY SITE"
- the four published Payment Methods the portal handles: `OMEGA_BANK` OMEGA Bank, `EVOUCHER` E-Voucher, `PAYMENTIQ_ALL` PaymentIQ and `COINSPAID_V2` CoinsPaid (no logo, so the portal shows a neutral icon). Strapi itself creates them on its first start (see [Payment Methods](#payment-methods)), so the seed creates only any that are missing

With Strapi running, from this folder, with the environment's own IPS URL (e.g. `https://ps.example.com/ps/ips`):

```bash
IPS_API=<the environment's IPS_API> pnpm run seed --theme=DARK
```

In the portal image, run it in the container, from the folder with the root `docker-compose.yml`: `docker compose exec omega-portal5 npm run seed -- --theme=DARK` (the image has Node's npm, which runs the script, but no pnpm). It reads IPS at the container's `PORTAL_IPS_API`, so it needs no `IPS_API`.

| Option | Values |
|---|---|
| `IPS_API` (env) | The environment's IPS URL, the same as the portal's `IPS_API`. Required, except in the portal image, which falls back to `PORTAL_IPS_API` |
| `--theme` | `DARK` (default) or `LIGHT`, the old `BRAND_THEME` setting |
| `--if-empty` | Skip, successfully, when Strapi already has content, instead of refusing. The portal's `pnpm dev:all` seeds a local Strapi this way, so a developer's first start fills it and later starts leave it alone |

For local development you don't need to run the seed yourself: the portal's `pnpm dev:all` starts this Strapi and seeds it when it's empty (see the portal's README).

The seed prints each Brand it creates. Without `--if-empty` it refuses to start if Strapi has any Brand, Game or Collection, published or not, so it never overwrites edits. Payment Methods don't count, as Strapi creates them on its first start. Any error stops it with `Seed failed: ...` and a non-zero exit. A seed that fails part-way leaves what it already created. The seed notes in Strapi when it starts and clears the note once it has created every Brand. While the note is set, the next run refuses, with or without `--if-empty`, and says when the unfinished seed started, so a part-seeded Strapi never passes as seeded. A Strapi part-seeded before this note existed has none, so check its Brand count yourself. Reset by deleting `data/` with Strapi stopped (or `docker compose down -v` with the portal image), which deletes all content and uploads, and seed again.

The seed runs its own Strapi on the same SQLite file while the server runs, and both write to it. Every transaction therefore takes SQLite's write lock at its start (`BEGIN IMMEDIATE`, set in `config/database.ts`, see `src/sqlite-transactions.ts`), so either process waits up to better-sqlite3's default 5-second busy timeout for the other. Without that, a save that read before it wrote failed at once with `SqliteError: ... database is locked` whenever the server happened to write, for example 15 seconds after its first start. If you still see that error, something held the lock for more than 5 seconds.

The seed's content is in `seed/`: `games.json` (title, provider, game ID, category and tile file, in lobby order), `brand.json` (the banners and the logo for each theme), `payment-methods.json` (each Payment Method's code, name and logo file), `legal/<page>.md` (each Legal Page: its `# ` title on the first line, then its body in a markdown subset of `#` to `###` headings, paragraphs, `-` and `1.` lists, `**bold**` and `[text](url)`, which `src/markdown-blocks.ts` turns into Strapi's rich-text Blocks; `{{brand}}` stands for the Brand's name, as plain text and never in a link's URL), and the images under `tiles/`, `banners/`, `logos/` and `payment-methods/`. Strapi refuses SVG uploads, so the Payment Method logos are PNGs, converted once from the portal's `public/sponsors/` SVGs (the PaymentIQ one is copied as it was). Brands added in IPS later get the same content from **Refresh from IPS** (below). `pnpm test` runs the seed's unit tests and checks the banner link rule.

## Brands added in IPS later

The seed creates a Brand for each brand IPS listed at the time. For a brand IPS lists later, open **Content Manager → Brand** and press **Refresh from IPS** above the list. After you confirm, Strapi reads IPS's `/getBrands`, with the seed's checks, and creates and publishes a Brand for every IPS brand it has none for, with its IPS ID and name and the seed's starter content: the Dark Theme, the Dark Theme's logo, the three banners, a lobby of every seed game still in the catalogue in the seed's order, the Slots and Sports Collections filled as the seed fills them (one an editor deleted is left out), all four starter Payment Methods switched on, and the seed's five Legal Pages in the Brand's name. It also gives the seed's five Legal Pages to every existing Brand that has none, its draft in the draft's name and its published version in the published name, whether IPS lists it or not, such as one seeded before Legal Pages existed. A summary then lists the Brands it added, the Brands it gave Legal Pages, how many were already there, and the Brands in Strapi that IPS no longer lists.

- It changes nothing else of an existing Brand, published or not, even one an editor renamed or emptied, and never deletes one. Delete a Brand IPS no longer lists yourself.
- A Brand counts as having Legal Pages when its draft or its published version lists at least one, and such a Brand is never touched, so pages an editor deleted on purpose stay deleted unless they deleted every one. A Brand with none gets them in both its draft and its published version (when it has one), written directly to each, so a published Brand shows them at once without publishing any unpublished changes in its draft. A draft with no name yet is skipped until it has one.
- It reuses the logo and banner images the seed uploaded, found in the Media Library by file name, and uploads one again only when it's gone, so pressing it again never duplicates images.
- It needs every starter Payment Method: if an editor deleted one, it stops with `Strapi has no Payment Method ...`, before uploading any image, and adds nothing; create it again under **Payment Method** first.
- When IPS fails or answers with an error, it shows the reason and creates nothing. Two refreshes at once run one after the other, so the second finds the first one's Brands and adds nothing.
- It creates all the new Brands and gives all the Legal Pages in one transaction, so when it fails part-way it writes none of them; only a logo or banner it had to upload again stays, and the next refresh reuses it. That transaction holds SQLite's write lock (see the seed's `BEGIN IMMEDIATE` above) until every new Brand is created, so a save made meanwhile waits, and fails with `database is locked` if creating them takes longer than 5 seconds.
- It refuses while the seed's note is set (see [Seed a new environment](#seed-a-new-environment)): while a seed runs, and after one that stopped part-way.
- The button shows, and the server allows the refresh (`POST /brand-refresh`, an admin route), only for admins whose role may both create and publish Brands, as it publishes what it creates. The Editor role may.

Strapi reads IPS's URL from `IPS_API`, the same URL as the portal's. `pnpm dev:all` passes the portal's `.env` `IPS_API` to Strapi, so a local Strapi needs nothing more, even with an older `strapi/.env`. With `pnpm dev:strapi` or `pnpm run develop`, set `IPS_API` in `strapi/.env` (add the line to an existing one). In the portal image Strapi falls back to the container's `PORTAL_IPS_API`, so nothing needs setting there. Without either, the refresh says to set `IPS_API`. The code is `src/brand-refresh.ts`; its plan (`src/brand-refresh-plan.ts`) and the starter Brand (`starterBrand` in `src/seed-data.ts`, shared with the seed) are unit tested.

## Where the content lives

Everything an editor creates sits under `data/` (in the portal image, `/srv/strapi/data`, the `strapi-data` volume):

| Path | What |
|---|---|
| `data/strapi.db` | The SQLite database |
| `data/public/uploads/` | Uploaded images, served at `/uploads/...` (`/strapi/uploads/...` in the portal image) |

Back up that one folder or volume to back up an environment's content. `data/`, `.env` and `node_modules/` are gitignored.

## Settings

Every setting and secret is in `.env.example`. Use different secrets in every environment; the portal image makes its own.

| Variable | Purpose |
|---|---|
| `PORTAL_ORIGIN` | The portal's origin, e.g. `http://localhost:3000`, when it isn't Strapi's own. Browsers may call the API only from here; unset, no other origin may, and Strapi warns at start outside production. The portal image leaves it unset |
| `IPS_API` | The environment's IPS URL, for **Refresh from IPS** (see [Brands added in IPS later](#brands-added-in-ips-later)). `pnpm dev:all` sets it from the portal's `.env`; the portal image falls back to `PORTAL_IPS_API` |
| `PUBLIC_URL` | Where browsers reach Strapi when that isn't its root. Only the portal image's build sets it, to `/strapi` |
| `IS_PROXIED` | `true` behind a proxy whose `X-Forwarded-*` headers Strapi should trust. The portal image sets it |
| `HOST`, `PORT` | Where Strapi listens (`0.0.0.0`, `1337`) |
| `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY` | Secrets. Generate each with `node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"` |
| `FLAG_NPS`, `FLAG_PROMOTE_EE`, `FLAG_DOC_LINKS` | Admin panel prompts and links (optional, default `true`) |

## Content types

All four use Draft & Publish: players only see what's published. Every image field (a Game's tile, a Brand's logo, a banner's image, a Payment Method's logo) shows the size and format to upload under the field; Strapi sets these on every start from `IMAGE_HINTS` in `src/admin-views.ts`, which follows `docs/game-tile-images.md` and `docs/banner-images.md`.

- **Game**, shared by every Brand: `provider`, `gameId`, `title`, `category` (its Game Category: `slots` or `sportsbook`, with no default, so the editor always chooses) and a `tile` image. The portal opens a `sportsbook` game as a sportsbook. Games saved when the category was free text said `sports`; Strapi renames those to `sportsbook` on every start. Strapi fills in `key` as `PROVIDER:gameId` on every save and ignores anything typed into it. Saving a second game with the same provider and game ID is refused, so after **Duplicate** change the provider or game ID before saving.
- **Brand**, one per IPS brand: `brandId` (unique, the IPS brand's ID), `name`, `theme` (`DARK` or `LIGHT`), a `logo` image, a list of `banners`, a `lobby`: an ordered list of Games, its `collections`: an ordered list of Collections, each holding ordered games from the lobby, its `paymentMethods`: its settings for each Payment Method (below), its `legalPages` (below), and its `featureVisibility`: a switch per Engage Feature (`jackpot`, `challenge`, `levelUp`, `quest` and `leaderboard`), on by default. The form shows them under **Feature visibility** as a switch per feature (Jackpot, Challenge, Level Up, Quest, Leaderboard); they're one JSON field drawn by a custom field (`global::feature-visibility`, `src/feature-visibility.ts` and `src/admin/feature-visibility/`). Switching one off hides every link, widget and banner into that feature on the Brand's pages; its page still opens by direct link. Promotions and Refer a friend have no switch. The Brand's form shows neither the lobby nor the Collections; edit them in the **Lobby editor** (below). Saving or publishing the form leaves them as they are. Strapi refuses to save a Brand whose Collections hold a game its lobby doesn't list (`src/brand-collections.ts`).
- **Collection**, shared by every Brand: `name`, `slug` (unique, filled in from the name, editable) and `icon`, one of `dice` (the default), `star`, `sparkles`, `flame`, `crown`, `cards`, `live` and `ball`. The portal draws each of these; a new icon needs portal support too (`COLLECTION_ICONS` in the portal's `src/components/games/lobby-model.ts`).
- **Payment Method**, shared by every Brand: `code` (unique and required, IPS's method code such as `OMEGA_BANK`), `name` (required, the default name) and a `logo` image (the default logo, optional).
- **Brand Payment Method** (a repeatable component on Brand, `paymentMethods`): a `paymentMethod`, `deposit` and `withdrawal` (switches, on by default), and an optional `name` and `logo` that replace the method's own for this Brand. Strapi refuses to save a Brand that lists the same Payment Method twice (`src/brand-payment-methods.ts`). The list's order doesn't matter: the portal keeps IPS's order.
- **Legal Page** (a repeatable component on Brand, `legalPages`): `page`, which of the five it is (`gaming-rules`, `player-protection`, `terms`, `privacy` or `complaints`; the portal shows it at `/legal/<page>`), `title`, a rich-text `body` (headings, lists, links) and an optional `updatedOn` date, which the portal shows as "Last updated". A page the Brand doesn't list shows "not available yet" on the portal. A new page needs portal support too.
- **Banner** (a repeatable component on Brand): `image`, `title`, `buttonText` and `link`. The link is a portal path such as `/leaderboard`, or a known dialog. The only dialog so far is `dialog:jackpot`; a new one needs portal support and a change to the pattern in `src/components/brand/banner.json`. Strapi checks the link when the Brand is published. List order is display order.

Strapi sets the admin's views on every start (`src/admin-views.ts`): Games are listed, searched and sorted by title, and the lobby and Collections stay off the Brand form.

## Collections

A Collection is a named group of games, such as Featured or New Releases, that each Brand may show as a link under Games in the portal's menu and as a tab on its Games page (`/games?collection=<slug>`). A game can be in several. Collections are not the Game Category, which says what a game is.

To create one, go to **Content Manager → Collection → Create new entry**, enter its name, check the slug Strapi fills in (it's the tab's address, so keep it short and stable), pick an icon and **Publish**. A Collection does nothing until a Brand shows it: add it to each Brand in the Lobby editor. An unpublished Collection never reaches the portal, even on a Brand. Deleting a Collection takes it off every Brand.

## Payment Methods

IPS decides which Payment Methods a player may use, in which order, and with which limits and fees. Strapi decides which of those each Brand shows, and under which name and logo. The portal shows a method only when IPS offers it and the Brand has it switched on for that direction; a method IPS offers that Strapi doesn't list stays hidden.

- To change how a Brand shows its methods, open the Brand in **Content Manager → Brand**. Under **paymentMethods**, each entry is one Payment Method: switch `deposit` and `withdrawal` on or off, and fill in `name` or `logo` only where the Brand calls or shows it differently. **Publish** the Brand for players to see it. Removing an entry hides that method on the Brand.
- To show a method IPS starts offering, create it under **Content Manager → Payment Method** with IPS's exact code, a name and a logo, **Publish** it, then add it to each Brand that shows it.
- An unpublished Payment Method never reaches the portal, even on a Brand.

### The one-time update on start

An environment seeded before Payment Methods existed, like the demo, has Brands with no Payment Method settings, which would show no methods. So the first time Strapi starts with this change, it:

1. creates and publishes any of the four starter Payment Methods (`seed/payment-methods.json`) that are missing, with their logos
2. gives every Brand that has no Payment Method settings all four, switched on for deposits and withdrawals, in both its draft and its published version, without publishing anything else in the draft. A Brand that showed Modified still does
3. records in Strapi's store that it ran, and never runs again in that environment

So a Brand an editor later clears keeps no methods, even after a restart. The code is `addStarterPaymentMethods` in `src/add-starter-payment-methods.ts`, which reads the starter file through `src/starter-payment-methods.ts` and plans its work in `src/starter-payment-methods-plan.ts`; its log line starts with `Payment Methods:`.

## Lobby editor

Build a Brand's lobby and choose its Collections on the **Lobby editor** page in the admin's main menu. Admins see it if their role may update Brands; the role must also be able to read Games and Collections, or the page can't load them.

1. Pick the Brand. Search by its name or Brand ID. Its status shows next to it, the same Draft, Modified or Published badge as in the Content Manager.
2. In **Catalogue**, tick the games the lobby lists. Every catalogue game is there with its tile, title, `PROVIDER:gameId` and Game Category. Filter by Game Category, or search by title, provider or game ID. **Select all** and **Clear** act on the games the filter shows, for example every slot. A newly ticked game goes at the end of the lobby.
3. In **Lobby**, drag the games into the order the portal shows them, or focus a game's handle and use the up and down arrow keys. Remove a game with its ✕ or by unticking it. A game you take out of the lobby also leaves the Brand's Collections; a notice above the tabs names those games before you save.
4. On the **Collections** tab, pick a Collection under **Add a Collection** to show it on this Brand. Drag the Collections, or use the arrow keys on their handles, into the order of the menu and tabs; ✕ takes one off this Brand. **Choose games** on a Collection lists the Brand's lobby games to tick, with the same search, Game Category filter, **Select all** and **Clear**, and its games to order and remove. A Collection with no games still shows its link and an empty tab. A Brand with no Collections shows All Games only.
5. **Save** keeps the lobby and Collections as a draft. **Publish** saves them and publishes the Brand, so players see it; it shows only if your role may publish Brands. Neither changes any other Brand field.

A game that was never published is marked "Draft — won't show until published". Publishing the Brand leaves it out of the published lobby, and publishing the Game later doesn't add it back: publish the Game first, then publish the Brand again (Publish stays available for that). The page asks before you leave it, or pick another Brand, with unsaved changes. Add new games to the catalogue under **Content Manager → Game**; the Lobby editor never creates or edits a Game. Strapi saves a draft without its required fields, so a Game, Brand or Collection saved that way isn't listed here until they're filled in. If the content manager ever answers in a shape the editor doesn't expect, the page shows an error and the browser console names what was wrong.

## Public access

On every start Strapi resets the Public role to `find` and `findOne` on Brand, Collection, Game and Payment Method, and removes any other public permission, including ones added in the admin panel. Public reads always return published content, even with `?status=draft`. Writes need an admin login.

The portal fetches a Brand with:

```
GET /api/brands?filters[brandId][$eq]=1&populate[logo]=true&populate[banners][populate][image]=true&populate[lobby][populate][tile]=true&populate[collections][populate][collection]=true&populate[collections][populate][games][fields][0]=key&populate[paymentMethods][populate][logo]=true&populate[paymentMethods][populate][paymentMethod][populate][logo]=true&populate[legalPages]=true
```

Each entry in `collections` has its `collection` (`name`, `slug`, `icon`; null when unpublished) and its `games` as keys in order; the portal finds them in the lobby.

Each entry in `paymentMethods` has `deposit`, `withdrawal`, the Brand's own `name` and `logo` (null when not set), and its `paymentMethod` (`code`, `name`, `logo`; null when unpublished).

Each entry in `legalPages` has `page`, `title`, `body` (Strapi Blocks JSON) and `updatedOn` (`YYYY-MM-DD`, or null).

`featureVisibility` comes back without populating, as `{ "jackpot": true, "challenge": true, "levelUp": true, "quest": false, "leaderboard": true }`, or as `null` on a Brand whose switches were never saved, such as a seeded or refreshed one. The portal shows a feature unless its switch is `false`.

Media URLs in the response are relative (`/uploads/...`), so the portal prefixes them with the Strapi URL.
