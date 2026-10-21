---
name: OMEGA Portal 5
description: The Omega Wins look as a dark showroom for the OMEGA player platform, one layout for every brand in a dark or light Colour Mode.
colors:
  showroom-blue: "#3A8DFF"
  showroom-blue-hover: "#3078E0"
  showroom-blue-deep: "#3568C2"
  signal-neon: "#E6FF01"
  jackpot-gold: "#F4C542"
  podium-silver: "#C7CCD6"
  podium-bronze: "#D08A4E"
  cabinet-black: "#101012"
  display-shelf: "#161618"
  field-dark: "#14181F"
  hover-step: "#1A1E26"
  glass-edge: "#1C2330"
  label-white: "#FFFFFF"
  soft-text: "#C3C2CC"
  dim-text: "#8A8F9C"
  faint-text: "#5C6373"
  danger: "#FA5252"
typography:
  display:
    fontFamily: "'Outfit Variable', BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: "'Outfit Variable', BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.2
  title:
    fontFamily: "'Outfit Variable', BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "'Outfit Variable', BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'Outfit Variable', BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.4
  section-label:
    fontFamily: "'Outfit Variable', BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.04em"
  button:
    fontFamily: "'Outfit Variable', BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 800
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "16px"
  xl: "24px"
spacing:
  xs: "10px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.showroom-blue}"
    textColor: "{colors.label-white}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: "36px"
    padding: "0 18px"
  button-primary-hover:
    backgroundColor: "{colors.showroom-blue-hover}"
  button-register:
    backgroundColor: "{colors.showroom-blue-deep}"
    textColor: "{colors.label-white}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: "36px"
  button-secondary:
    backgroundColor: "{colors.field-dark}"
    textColor: "{colors.label-white}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: "36px"
  button-secondary-hover:
    backgroundColor: "{colors.hover-step}"
  input-field:
    backgroundColor: "{colors.field-dark}"
    textColor: "{colors.label-white}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 12px"
  card-panel:
    backgroundColor: "{colors.display-shelf}"
    textColor: "{colors.label-white}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  nav-link:
    textColor: "{colors.label-white}"
    rounded: "{rounded.md}"
  nav-link-active:
    backgroundColor: "{colors.hover-step}"
    textColor: "{colors.label-white}"
  game-tile:
    backgroundColor: "{colors.field-dark}"
    rounded: "{rounded.lg}"
  wallet-pill:
    backgroundColor: "{colors.field-dark}"
    textColor: "{colors.label-white}"
    rounded: "12px"
    height: "40px"
  dialog:
    backgroundColor: "{colors.display-shelf}"
    textColor: "{colors.label-white}"
    rounded: "{rounded.lg}"
---

# Design System: OMEGA Portal 5

## Overview

**Creative North Star: "The Showroom Cabinet"**

The portal is a polished demo cabinet for the OMEGA platform. Every player feature sits on display in a calm, dark case, and light only falls where the action is: the one button that moves the player forward, the amount they won, the jackpot they joined. The look is the Omega Wins frontend madmen built, carried over in its layout, components, colours, type and motion, and its layout, components and type are the same for every brand. A brand changes only its **Brand Theme**, the colours and the logo. This document describes the default Dark Theme (Dark Mode with the Omega Wins colours); Light Mode and the Kambi colours are under Colors.

In Dark Mode the cabinet is dark throughout and dense in the way a casino lobby is dense: a fixed sidebar, a header with the wallet and avatar, and rows of portrait game tiles, all on near-black surfaces separated by a single cool border rather than by shadow. Colour is rationed. Showroom Blue carries every primary action; Signal Neon and Jackpot Gold are signals, not paint, and appear only where something worth noticing happened. Controls are calm and precise: dark fields, crisp 1px edges, heavy labels on solid buttons, and quick 75ms responses that never bounce.

**Key Characteristics:**
- Dark Mode: near-black body, a slightly raised shelf for panels, a cooler dark for fields.
- One primary voice (Showroom Blue); neon and gold reserved for wins, amounts, active states and jackpots.
- Flat surfaces separated by tone and a 1px Glass Edge border; soft shadows only on floating layers.
- One typeface, Outfit, with heavy 800 button labels and 700 headings.
- 8px corners on controls, 16px on cards, tiles and dialogs.
- Quick motion: 75ms colour changes, 150ms fades, everything off for reduced motion.

## Colors

A near-black cabinet lit by one confident blue, with neon and gold kept back for the moments that matter.

### Primary
- **Showroom Blue** (#3A8DFF): every primary action (Spin, Deposit, Continue, Claim, Play), links, focus rings, selected states and the brand colour of the theme. Its hover is **Showroom Blue Hover** (#3078E0).
- **Showroom Blue Deep** (#3568C2): the register call to action, Deposit and the wallet button in the header (the theme's `cta` role), a shade deeper so it reads as the money and sign-up action beside ordinary blue.

### Secondary
- **Signal Neon** (#E6FF01): the platform's highlight. Winner amounts, the currency symbol in the wallet, badges, the active sidebar item's 3px accent bar, progress fills, quest points.

### Tertiary
- **Jackpot Gold** (#F4C542): jackpots and prizes only. Tier values, the prize amount under the wheel, the wheel's pointer, the top three places in a leaderboard.
- **Podium Silver** (#C7CCD6) and **Podium Bronze** (#D08A4E): second and third place, and the silver and bronze jackpot tiers beside gold.

### Neutral
- **Cabinet Black** (#101012): the page body behind everything.
- **Display Shelf** (#161618): raised panels, the sidebar, cards and dialogs.
- **Field Dark** (#14181F): inputs, secondary buttons, the wallet pill, game tile backdrops.
- **Hover Step** (#1A1E26): the one-step-lighter tone for hover and the active sidebar item.
- **Glass Edge** (#1C2330): the 1px border on panels, fields, tiles and dialogs, and dividers.
- **Label White** (#FFFFFF): primary text and button labels.
- **Soft Text** (#C3C2CC): secondary text, field labels, leads.
- **Dim Text** (#8A8F9C): placeholders, captions, section labels, chevrons (about 5.6:1 on Field Dark).
- **Faint Text** (#5C6373): the faintest lines and empty tracks.
- **Danger** (#FA5252): destructive actions and errors (Mantine's red, named for its role; Mantine itself writes errors in a darker red, which the theme replaces with this one).

### Tinted badges
Tinted badges, alerts and subtle buttons in a one-colour role (signal, gold, silver, bronze, CTA) sit on a 15% tint of the colour, written in the colour itself; Mantine would fill them with the colour darkened under the same colour. The CTA blue is too dark as text on black, so wherever it is text it is lightened. Danger text and outlines use Danger too.

### Light Mode
Light Mode keeps every role but turns the page light, as on the Kambi sportsbook: page #F6F6F7, white cards and fields, borders #E4E4E4, text #2D3032, dimmed text #6C6C6C. The header, sidebar, phone menu and bottom nav stay dark in the brand's deepest shade (brand 8), with text mixed from white into it and raised steps from brand 6 lifted with white, so any Brand Colours give a matching shell. Signal and gold text and outlines are darkened to half their brightness on the light page and glow as usual on the shell. Tinted badges and alerts in a one-shade colour (signal, gold, silver, bronze, CTA) take a 15% tint of it with the darkened colour as text, since Mantine's light scheme would draw them in the colour on itself; a neutral tinted badge takes a tint of the dimmed grey under the secondary text colour. Errors and danger text use the brand's danger shade 7 (Kambi #D42A1F), as Mantine's red is too faint on white. The shell and the page footer show the Brand's own logo from Strapi, the same image in either Colour Mode; a Brand without a logo shows its name in the heading weight instead, or nothing until its name is known.

### Kambi colours
The Light Theme's Brand Colours, taken from the Kambi sportsbook's live front end:
- **Brand** is Kambi Navy (#004572) for primary actions, with Kambi Top Bar (#002B47) as its deepest shade.
- **CTA** is Cash Out Green (#0E8668).
- **Neon** is Kambi Cyan (#00C4DE), for the same signals as Signal Neon.
- **Gold** is #FFD23A; silver and bronze are the Omega Wins ones.

### Named Rules
**The Signal Rule.** Signal Neon marks wins, amounts, active states and badges. It is never a decorative fill, a large area or a background wash.

**The Jackpot Gold Rule.** Gold means a jackpot or a prize. If nothing was won or can be won, nothing is gold.

**The Theme Only Rule.** Every colour comes from the Mantine theme (`src/providers/mantine-theme/`); the colour guard test fails on hex, rgb, hsl or off-palette names anywhere else.

## Typography

**Display Font:** Outfit Variable (with BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif)
**Body Font:** Outfit Variable (same stack)

**Character:** A single geometric sans does every job. Weight carries the hierarchy: 400 for reading, 700 for headings, 800 for anything you can press, so actions read heavier than the words around them.

### Hierarchy
- **Display** (700, 48px, 1.2): the home hero headline only.
- **Headline** (800, 28px, 1.2): page titles such as "Deposit with OMEGA_BANK" and the deposit confirmation's amount.
- **Title** (700, 22px, 1.4): dialog titles; card titles step down to 700 at 16px.
- **Body** (400, 16px, 1.55): running text; leads and notes drop to 14px in Soft Text, captions to 12px in Dim Text.
- **Label** (500, 14px): field labels in Soft Text, sentence case.
- **Section Label** (600, 12px, 0.04em, uppercase): sidebar group headings ("Social Center", "Games") in Dim Text, the one place type is set in capitals.
- **Button** (800, 14px): every button label.

### Named Rules
**The Heavy Action Rule.** Anything pressable is set at 800; nothing that isn't pressable is.

**The Tabular Money Rule.** Amounts, balances and countdowns use tabular figures so columns of money line up.

## Layout

A fixed desktop sidebar of about 286px holds the Level Up and Quest widgets, then the Social Center and Games groups, the winner ticker and Logout. The header (74px) carries game search on the left and notifications, the wallet pill and the avatar on the right. When the environment has more than one Brand, the Brand switcher (a field like the search, with a store icon) sits in the right-hand group, just left of the account controls (notifications, wallet and avatar, or the sign-in buttons), from md up, and at the top of the sidebar or the phone menu below that; a padlock replaces its chevron while a player is signed in. While a newly picked Brand loads, the current Brand stays on screen and a 3px Signal Neon bar slides across the top of the window, still and full width for reduced motion; the new Brand Theme and content then replace it at once. Content sits in a centred column up to 1400px wide with 20px side padding (12px on phones).

Spacing follows Mantine's scale (10, 12, 16, 20, 32px): 16px between controls in a panel, 20px between page sections. Game tiles are 3:4 portraits in responsive rows. Below the sm breakpoint (48em) the sidebar becomes a right-hand drawer and a fixed bottom nav (Register or Deposit/Buy Coins, Home, Promotions, Games, Menu) takes over; below md (62em) the game page's rail of cards drops under the game, and wide two-column forms stack.

## Elevation & Depth

Depth is tonal. Resting surfaces are flat: the body is Cabinet Black, panels step up to Display Shelf or Field Dark, and a 1px Glass Edge border separates one surface from the next. Only layers that float above the page (menus, popovers, dialogs, toasts) carry a soft shadow, Mantine's `md`. Text over artwork gets a thin text shadow to stay readable, and hovered Play buttons on tiles get an inset 2px white ring instead of a lift.

### Shadow Vocabulary
- **Overlay Lift** (`var(--mantine-shadow-md)`): menus, popovers, the phone country picker and other floating layers.
- **Art Legibility** (`text-shadow: 0 1px 2px` in black): titles set directly on game art.
- **Tile Ring** (`box-shadow: inset 0 0 0 2px` in white): the hovered Play button on a game tile.

### Named Rules
**The One Edge Rule.** A resting surface separates from its neighbour with one tonal step and one 1px Glass Edge border, never a shadow.

**The Overlay Lift Rule.** Shadows belong to things that float. If it scrolls with the page, it is flat.

## Shapes

Corners are gently rounded and tiered by size: 8px on buttons, inputs, menu items and nav links; 16px on cards, panels, game tiles and dialogs; 12px on the header wallet pill and its menu; full circles for avatars' initials, coin badges and progress rings. Borders are always 1px Glass Edge. Game art is clipped to its 16px tile.

## Components

### Buttons
Calm, solid and heavy-labelled; they change colour instantly and never move.
- **Shape:** gently rounded (8px), 36px tall by default.
- **Primary:** Showroom Blue fill, white 800 label; hover darkens to Showroom Blue Hover in 75ms.
- **Register / wallet:** Showroom Blue Deep, for sign-up and money actions.
- **Secondary (default):** Field Dark fill with a 1px Glass Edge border and white label; hover steps to Hover Step.
- **Focus:** Mantine's focus ring in Showroom Blue on keyboard focus only.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** Display Shelf, with Field Dark inner tiles (jackpot tiers, challenge rows, table rows).
- **Shadow Strategy:** none (The One Edge Rule).
- **Border:** 1px Glass Edge.
- **Internal Padding:** 16px (12px on phones).

### Inputs / Fields
- **Style:** Field Dark fill, 1px Glass Edge border, 8px corners, at least 44px tall; labels above in Soft Text at 14px/500, or a placeholder alone in Dim Text on the sign-in and sign-up forms.
- **Focus:** the border turns Showroom Blue.
- **Error:** the border turns Danger, with a 12px message below.

### Navigation
- **Sidebar:** white 500 labels with an icon, 8px rounded rows; hover and the active row take Hover Step, and the active row adds a 3px Signal Neon bar on its left edge. Group headings use the Section Label style; groups are split by a Glass Edge divider.
- **Bottom nav (phones):** five equal slots with an icon over an 11px/600 label; the first slot is the register or deposit call to action in Showroom Blue Deep.
- **Tabs:** an underline strip on a Glass Edge baseline; the open tab is white with a Showroom Blue underline.

### Header Wallet (signature)
The balance and the deposit action in one Field Dark pill (at least 180px by 40px, 12px corners, 1px Glass Edge): a Signal Neon currency symbol, the amount in white at 800, a Dim Text chevron, and a 32px Showroom Blue Deep wallet button set inside on the right. Its menu lists each account on a gold coin with its total, the selected one on Hover Step, then cash, bonus and any cashback to claim.

### Game Tile (signature)
A 3:4 portrait with 16px corners on a Field Dark backdrop; the whole art is a click target. On hover a light shade fades in over 150ms with the name at the top left, a favourite heart at the top right and a full-width Play button along the bottom; touch screens show a compact Play at all times.

### Jackpot Prize Wheel (signature)
An SVG wheel in the cabinet's own colours: dark segments alternating Field Dark and Hover Step, each edged at the rim in its tier's colour (bronze, silver, gold, and a lighter blue for Platinum), white names laid along each segment that always read left to right, and a Jackpot Gold pointer. GSAP turns it six times over five seconds with a slow settling finish; on landing the prize's segment washes in its colour, the rest dim, a confetti burst flies out over the dialog and the prize rises into place in gold. Players who reduce motion see it land without turning or confetti.

## Do's and Don'ts

### Do:
- **Do** keep every surface dark: Cabinet Black for the page, Display Shelf for panels, Field Dark for fields.
- **Do** give each screen one primary action in Showroom Blue, with everything else on Field Dark.
- **Do** separate resting surfaces with a 1px Glass Edge border and a tonal step (The One Edge Rule).
- **Do** set every pressable label at 800 and every heading at 700, in Outfit.
- **Do** use 8px corners on controls and 16px on cards, tiles and dialogs.
- **Do** keep colour changes at 75ms and fades at 150ms, and switch motion off for reduced motion.
- **Do** take every colour from the theme, so the colour guard test passes.

### Don't:
- **Don't** add a light surface in Dark Mode; a light page is Light Mode.
- **Don't** use Signal Neon as decoration, a large fill or a background wash (The Signal Rule).
- **Don't** use Jackpot Gold for anything that isn't a jackpot or a prize.
- **Don't** put shadows on resting cards or panels; only floating layers lift.
- **Don't** give a brand its own fonts or layout; a brand picks a Brand Theme (Colour Mode, Brand Colours and logo) and nothing else.
