import { Box, Typography } from '@strapi/design-system';
import type { EditorGame } from './lobby-api';
import { DraftNote } from './DraftNote';

// Tiles are 3:4 portraits (docs/game-tile-images.md in the portal).
const TILE_WIDTH = 36;
const TILE_HEIGHT = 48;

/** A game's tile thumbnail, or an empty frame when it has no tile. */
export const GameTile = ({ tileUrl }: { tileUrl: string | null }) =>
  tileUrl ? (
    <img
      src={tileUrl}
      alt=""
      width={TILE_WIDTH}
      height={TILE_HEIGHT}
      loading="lazy"
      style={{ objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
    />
  ) : (
    <Box background="neutral150" hasRadius width={`${TILE_WIDTH}px`} height={`${TILE_HEIGHT}px`} shrink={0} />
  );

/** A game's title, its `PROVIDER:gameId` key and, for a game never published, why the portal won't show it. */
export const GameLabel = ({ game }: { game: EditorGame }) => (
  <Box minWidth={0}>
    <Typography tag="span" variant="omega" fontWeight="semiBold" display="block" ellipsis>
      {game.title}
    </Typography>
    <Typography tag="span" variant="pi" textColor="neutral600" display="block" ellipsis>
      {game.provider}:{game.gameId}
    </Typography>
    {game.isDraft ? <DraftNote /> : null}
  </Box>
);
