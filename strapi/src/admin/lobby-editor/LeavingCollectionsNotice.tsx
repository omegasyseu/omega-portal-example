import { Box, Typography } from '@strapi/design-system';
import type { GameLeavingCollections } from './lobby-selection';
import type { EditorCollection, EditorGame } from './lobby-api';

type LeavingCollectionsNoticeProps = {
  leaving: readonly GameLeavingCollections[];
  gamesById: ReadonlyMap<string, EditorGame>;
  collectionsById: ReadonlyMap<string, EditorCollection>;
};

/** Before saving, names each game that leaves the Brand's Collections because it left the lobby. */
export const LeavingCollectionsNotice = ({ leaving, gamesById, collectionsById }: LeavingCollectionsNoticeProps) =>
  leaving.length === 0 ? null : (
    <Box background="warning100" borderColor="warning200" hasRadius padding={4} role="status">
      <Typography tag="p" fontWeight="semiBold">
        Saving also takes {leaving.length === 1 ? 'this game' : 'these games'} out of this Brand's Collections,
        because {leaving.length === 1 ? "it's" : "they're"} no longer in the lobby:
      </Typography>
      <Box tag="ul" paddingTop={2}>
        {leaving.map(({ documentId, collectionIds }) => (
          <Typography key={documentId} tag="li">
            {gamesById.get(documentId)?.title ?? documentId} (
            {collectionIds.map((id) => collectionsById.get(id)?.name ?? id).join(', ')})
          </Typography>
        ))}
      </Box>
    </Box>
  );
