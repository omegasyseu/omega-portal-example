# Game tile images

Supply game-card images in **3:4 portrait**, with a recommended export size of
**960×1280 pixels**. The ratio controls the fit; increasing resolution alone does
not fix a landscape image in a portrait card.

| Property | Requirement |
| --- | --- |
| Aspect ratio | 3:4, width to height |
| Recommended export | 960×1280 px |
| Other suitable sizes | 768×1024, 1086×1448, 1200×1600 px |
| Format | AVIF for deployed assets |
| Edges | Full background, square corners, no baked-in border |
| Thumbnail check | 205×273 px, plus actual mobile and small fixed-size cards |

The card applies rounded corners and uses `object-fit: cover`. Supply portrait
artwork so the image fills the card without losing its sides. See
[game-card styles](../src/components/games/game-card/card.module.css).
Small cards with an explicit width and height can have a different ratio and
need a separate visual check.

---

## Composition and text placement

Measure positions from the top of the image:

- Keep the top 15% free of lettering and essential facial details. The card title
  and favourite button can appear here.
- Place the game title within 60% to 75% of the image height, on at most two lines.
- Place the provider directly underneath, within 75% to 80%, on one line.
- Keep the bottom 20% free of lettering and essential subject details. The Play
  button appears here on hover/focus and stays visible on touch screens.
- Keep important content at least 6% away from the left and right edges.

These areas guide asset creation. Check the actual overlays at the final card
size, especially long names and small tiles. Generic fallback art uses a genre
label and omits the provider line.

Copy this size instruction into an image request:

```text
Create one opaque portrait game tile at 960×1280 pixels, aspect ratio 3:4.
Fill the background edge to edge; no border or rounded corners.
Keep the top 15% and bottom 20% free of text and essential subject details.
Place the exact game title within 60–75% of the height, on at most two lines,
and the provider underneath within 75–80%. Keep important content at least
6% away from the left and right edges. Make the lettering read at 205×273 px.
```

If a generator returns another resolution, preserve the portrait proportions.
Export to 960×1280 without stretching the subject or cropping lettering.

---

## Reusing existing artwork

### Visual style

Use a calm, clean illustrated treatment: one dominant subject, a simplified
background, soft diffuse light, moderate saturation and restrained highlights.
When original art exists, preserve its recognisable subjects, costumes, palette,
theme and distinctive title shapes while adapting the composition to portrait.
Reduce exaggerated shine, bevels and glow. Avoid explosive rays, fireworks,
sparkles, neon halos and decorative flying coins. Coins, flames or other effects
that define the original game's theme can remain, with a quieter treatment.

Generic defaults use simple genre-specific subjects and flat white lettering.
Use the same composition and safe areas across game-specific art and defaults.

### Source proportions

Check the original ratio before reusing supplied artwork. The original Mustang
Gold, The Dog House and Sugar Rush sources are 325×234 px. They fit landscape
cards, but filling a 3:4 card crops their sides. Changing their pixel dimensions
without changing the ratio does not solve this.

Use a provider-supplied portrait version when available. Otherwise regenerate or
reframe the image for portrait using the original as a subject and palette
reference. Preserve the recognisable subjects, game name and provider spelling.
Never stretch landscape artwork to portrait. Keeping a whole landscape image
with space above and below requires a separate display treatment; the current
card fills its frame.

---

## Asset locations and checks

Game tiles are uploaded to Strapi: each Game's `tile` image, shown by every Brand
whose lobby lists that Game ([strapi/README.md](../strapi/README.md)). The portal
bundles no tiles. The collection a new environment is seeded with lives in
`strapi/seed/tiles/`; generic defaults live in `strapi/seed/tiles/defaults/`. Dialog and
page art lives in `public/backgrounds/`; lobby banner art is uploaded to Strapi
([banner images](banner-images.md)).

The seeded portrait collection includes 3 Oaks, Hyperion, sports and Pragmatic Play.
The original source files the generation prompts started from, and every other
unreferenced graphic, have been removed; they remain in git history if a tile needs
to be generated again. Generic defaults are available for future games without
artwork:

| Genre | File under `strapi/seed/tiles/defaults/` |
| --- | --- |
| Slots | `slots.avif` |
| Blackjack | `blackjack.avif` |
| Baccarat | `baccarat.avif` |
| Roulette | `roulette.avif` |
| Poker | `poker.avif` |
| Live casino | `live-casino.avif` |
| Arcade | `arcade.avif` |
| Sports betting | `sportsbook.avif` |

These defaults have genre labels and no provider name. Upload one explicitly as
the tile when adding a game; neither Strapi nor the portal assigns them
automatically.

Use descriptive filenames such as `aztec_fire.avif` or `slots.avif`. Filenames
can differ from backend game IDs. In Strapi, upload the tile on the Game whose
provider and game ID both match, since some providers share IDs, then publish
it. To change what a new environment is seeded with, add the file under
`strapi/seed/tiles/` and name it as the Game's `tile` in `strapi/seed/games.json`.

Convert source artwork to AVIF before uploading it. The current
collection uses libavif at quality 70 with full colour resolution (YUV 4:4:4),
lossless alpha and unchanged pixel dimensions:

```sh
avifenc --qcolor 70 --qalpha 100 --yuv 444 --speed 6 source.png tile.avif
```

JPEG input is also supported. Compare lettering at thumbnail size after
conversion. Upload only the AVIF.

Before integrating an image:

1. Check the dimensions, encoding and opaque background.
2. Check exact title/provider spelling and readable lettering at thumbnail size.
3. Check subject and lettering cropping in desktop, mobile and small cards.
4. Check the hover/focus title, favourite button and Play button over the image.
