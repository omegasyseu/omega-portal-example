# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

OMEGA Portal 5 has three audiences, all confirmed:

- **Operators in a sales demo.** OMEGA staff walk prospective and existing operators through the portal to show which player features the OMEGA backend already supports. The players on screen are demo accounts.
- **Operators seeing it under their own brand.** The same portal runs as a white-labeled demo, so an operator sees the features with their brand applied.
- **Client frontend teams.** Client developers use it as a reference for building their own player portal against IPS and AMS.

End players are the people the screens are written for, but in every confirmed use the person judging the portal is an operator or a client developer, not a paying player.

## Product Purpose

The portal shows off, in a real browser, the player features the OMEGA backend already exposes:

- sign-up and login
- payments: deposit and withdraw, or purchase and redeem on social brands
- games, the player profile and Responsible Gaming
- the Engage products: challenges, quests, Level Up, leaderboards, jackpots and cashback
- Chronos in-app notifications

It succeeds when an operator can see a feature working end to end and believe it will work for their brand, and when a client developer can read how the feature is wired. *(Success wording inferred from the confirmed audiences; no formal metric exists.)*

## Positioning

Every screen calls the real OMEGA backend from the browser (IPS for most calls, AMS for leaderboards, quests, jackpot events and the winner ticker) rather than mocked data, so whatever the demo shows is live platform behaviour. *(Inferred from the README and code; not separately confirmed.)*

## Operating Context

- Shown live in sales conversations, and deployed per environment as one container running nginx and the environment's Strapi; the portal's `PORTAL_*` placeholders are replaced at start-up, so one build serves every environment.
- A **Brand** owns a portal's content and settings: games, banners, Collections, Payment Methods and its **Brand Theme** (Colour Mode, Brand Colours and logo). A Brand never borrows another Brand's content: where it has none, that part of the portal is empty. Terms follow `GLOSSARY.md`.
- Brands are either real-money or social casino (`isSocialBrand`), which switches payments between Deposit/Withdraw and Purchase/Redeem.
- Players can hold several currency accounts (a **Primary Account** plus **Associated Accounts**), switched from the account list in the header wallet (the balance pill, as on Omega Wins).

## Capabilities and Constraints

- **One layout for every brand, themed per brand.** The portal copies the Omega Wins demo frontend that madmen built (https://omega.madmenmt.com): its layout, components, type and motion, but none of madmen's artwork or features. A brand changes only its Brand Theme: Dark Mode with the Omega Wins colours (the default) or Light Mode with the Kambi sportsbook's colours, and shows its own logo.
- The Strapi address is set at deploy time through `public/runtime-config.js` (`STRAPI_URL`). Each Brand's Brand Theme, logo, banners, lobby, Collections and Payment Methods come from that environment's Strapi.
- The visitor picks the **Selected Brand** in the header's Brand switcher (shown when IPS lists more than one Brand). It is remembered in the browser, starts on the first Brand IPS lists, and is locked to the player's own Brand while they are signed in. Sign-in and sign-up use it and have no brand field.
- Stack is fixed by the codebase: React 19, TanStack Router and Query, Mantine 9. GSAP (with `@gsap/react`) and Motion animate the jackpot win wheel; GSAP is under its standard no-charge licence, not an OSI licence, so it needs checking against any company dependency-licence policy. Motion is MIT.
- Features the portal shows must exist in the OMEGA backend. The portal displays them; it does not invent them.
- No client runs the portal for real-money players in production: it is a sales demo and a reference for client frontend teams (confirmed).

## Brand Commitments

- The layout and components are the Omega Wins look, which carries OMEGA identity. A brand's own identity appears only through its Brand Theme: its colours, light or dark pages, and logo.
- Domain vocabulary from `GLOSSARY.md` is binding in UI copy, for example "Self-exclusion" rather than "Take a break", and "RG Limit" rather than "Personal limit".

## Evidence on Hand

- Brand logo: each Brand's logo is uploaded in Strapi; the portal shows the Brand's name when there is none. Payment Method names and logos come from Strapi too, per Brand; a method without a logo shows a neutral icon. Game tiles are uploaded in Strapi too. Other assets under `public/` include backgrounds, icons and sponsors.
- Glossary: `GLOSSARY.md`. Strapi: `strapi/README.md`.
- No testimonials, client logos, case studies or usage figures are on hand. Future work must not invent them.

## Product Principles

1. **Show what's real.** Every feature on screen runs against the live backend. Never fake a capability the platform doesn't have.
2. **One look, many brands.** One codebase and one look serve OMEGA real-money, OMEGA social and partner brands such as Kambi. Brands differ only in Brand Theme, content and real-money versus social payments. Those choices live in brand configuration, not scattered through feature code.
3. **Readable as a reference.** Client developers learn from this code, so a clear implementation of a feature matters as much as how it looks.
4. **Every feature demos end to end.** A flow that stops halfway undermines the sales story more than a missing feature does.

## Accessibility & Inclusion

No formal accessibility or regulatory standard is required. Responsible Gaming tools remain part of the product's feature set.
