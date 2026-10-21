# Banner images

Use quiet illustrated artwork with soft diffuse lighting, matte surfaces,
restrained highlights and simple grounded subjects. Keep backgrounds sparse.
Use charcoal, muted teal or plum, antique brass and warm ivory. Avoid neon,
sparkles, flying coins, confetti, fireworks, lens flare and dramatic rays.

Keep all headings, offers and buttons in HTML. Banner artwork must contain no
text, logos, offer amounts or baked-in controls. Create opaque PNG source images
with full backgrounds, square corners and no borders; the components apply
rounding. Convert to AVIF for deployment using the
[game tile conversion settings](game-tile-images.md#asset-locations-and-checks).
Keep source dimensions and any existing transparency when converting artwork.

| Placement | Recommended generation size | Ratio | Composition |
| --- | --- | --- | --- |
| Lobby hero, desktop | 1920×640 px | 3:1 | Subject in right 40%; left 55% quiet for text |
| Lobby hero, mobile | 1280×1024 px | 5:4 | Subject upper right; lower 45% quiet for text |
| Game-page carousel banners | 1536×768 px | 2:1 | Subject in right third; left 60% quiet for text |
| Home casino and rewards cards | 1024×1024 px | 1:1 | Subject in middle/lower area; top 30% and bottom 18% quiet |
| Sign-up and jackpot dialog art | 960×1280 px | 3:4 | Subject in central 60–65%; quiet space above and below |
| Deposit bonus choice cards | 1536×1024 px | 3:2 | Subject near centre; bottom 35% and top-right corner quiet |

The hero is at least 420 px tall on desktop and 340 px on small screens.
Carousel banners are at least 160 px tall. Promotion cards are at least 300 px
tall on desktop and 160 px on small screens. Dialog images follow the adjacent
content height and are hidden on small screens. These are responsive containers,
so the recommended asset dimensions are source sizes, not fixed display sizes.

All these surfaces use `cover`, which can crop the source. Keep focal subjects
inside the listed areas and check narrow and wide layouts with actual headings
and buttons. Use the mobile hero composition rather than cropping the desktop
hero to a narrow panel. If a generator returns another resolution, retain the
requested proportions and inspect the resulting crop.

Assets live in `public/backgrounds/`, except the game-page carousel banners:
each Brand's banner images are uploaded with its banners in Strapi, and the
carousel keeps the right edge when it crops them.

Consumers:

- [Lobby hero](../src/components/home/home-hero.tsx)
- [Home hero and promotion styles](../src/components/home/home.module.css)
- [Game-page carousel](../src/components/games/lobby-banners.tsx)
- [Sign-up dialog](../src/components/auth/auth-modal.tsx)
- [Jackpot dialog](../src/components/jackpot/jackpot-modal-content.tsx)
- [Deposit bonus picker](../src/components/payments/components/ui/bonus-plan-picker.tsx)

The shared deposit bonus picker uses `rewards-promo.avif` when a plan has no
`imageUrl` or its image fails to load. `deposit-without-bonus.avif` is neutral
wallet artwork for the first option, labelled "Deposit without a bonus".
Selecting it keeps the bonus ID empty; it does not add a bonus to the deposit.
Both choices use the same 3:2 frame and radio selection styling. Keep labels
in HTML and avoid gifts, coins or prize imagery in the no-bonus artwork.
