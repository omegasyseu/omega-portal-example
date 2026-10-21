import { Badge, Box, Flex, IconButton, Typography } from '@strapi/design-system';
import { Cross } from '@strapi/icons';
import { gameCount, type GameIds } from './lobby-selection';
import type { EditorGame } from './lobby-api';
import { DraggableRow } from './DraggableRow';
import { GameLabel, GameTile } from './GameTile';
import { useReorder } from './useReorder';

type GameListPanelProps = {
  /** The list's heading: "Lobby", or the Collection's name. */
  title: string;
  /** What to say while the list has no games. */
  emptyText: string;
  games: GameIds;
  gamesById: ReadonlyMap<string, EditorGame>;
  onMove: (from: number, to: number) => void;
  onRemove: (documentId: string) => void;
};

/**
 * Games in the order the portal shows them: the Brand's lobby, or one of its Collections.
 * Drag a game, or use the arrow keys on its handle, to move it.
 */
export const GameListPanel = ({ title, emptyText, games, gamesById, onMove, onRemove }: GameListPanelProps) => {
  const reorder = useReorder(games, onMove);

  return (
    <Box background="neutral0" hasRadius shadow="tableShadow" padding={6}>
      <Flex direction="column" alignItems="stretch" gap={4}>
        <Flex gap={2}>
          <Typography tag="h2" variant="delta">
            {title}
          </Typography>
          <Badge>{gameCount(games.length)}</Badge>
        </Flex>
        {games.length === 0 ? (
          <Typography textColor="neutral600">{emptyText}</Typography>
        ) : (
          <Box tag="ol" maxHeight="60vh" overflow="auto">
            {games.map((documentId, index) => {
              const game = gamesById.get(documentId);
              const label = game?.title ?? documentId;
              return (
                <DraggableRow key={documentId} index={index} name={label} reorder={reorder}>
                  <GameTile tileUrl={game?.tileUrl ?? null} />
                  <Box flex="1" minWidth={0}>
                    {game ? <GameLabel game={game} /> : <Typography>{label}</Typography>}
                  </Box>
                  <IconButton variant="ghost" label={`Remove ${label}`} onClick={() => onRemove(documentId)}>
                    <Cross />
                  </IconButton>
                </DraggableRow>
              );
            })}
          </Box>
        )}
      </Flex>
    </Box>
  );
};
