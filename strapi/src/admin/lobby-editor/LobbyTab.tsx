import { useCallback } from 'react';
import { Grid } from '@strapi/design-system';
import {
  clearGames,
  moveInList,
  selectGames,
  toggleGame,
  withLobby,
  type BrandSelection,
  type Lobby,
} from './lobby-selection';
import type { EditorGame } from './lobby-api';
import { CataloguePanel } from './CataloguePanel';
import { GameListPanel } from './GameListPanel';

type LobbyTabProps = {
  games: readonly EditorGame[];
  gamesById: ReadonlyMap<string, EditorGame>;
  lobby: Lobby;
  onChange: (change: (current: BrandSelection) => BrandSelection) => void;
};

/** The Brand's lobby: games ticked from the catalogue, and their order. */
export const LobbyTab = ({ games, gamesById, lobby, onChange }: LobbyTabProps) => {
  // A change to the lobby also takes any game it drops out of the Brand's Collections.
  const changeLobby = useCallback(
    (change: (lobby: Lobby) => Lobby) => onChange((current) => withLobby(current, change(current.lobby))),
    [onChange],
  );
  const toggle = useCallback(
    (documentId: string) => changeLobby((current) => toggleGame(current, documentId)),
    [changeLobby],
  );

  return (
    <Grid.Root gap={4} paddingTop={4}>
      <Grid.Item col={7} s={12} alignItems="stretch" direction="column">
        <CataloguePanel
          title="Catalogue"
          name="catalogue"
          games={games}
          picked={lobby}
          onToggle={toggle}
          onSelectAll={(shown) => changeLobby((current) => selectGames(current, shown))}
          onClear={(shown) => changeLobby((current) => clearGames(current, shown))}
        />
      </Grid.Item>
      <Grid.Item col={5} s={12} alignItems="stretch" direction="column">
        <GameListPanel
          title="Lobby"
          emptyText="No games yet. Tick games in the catalogue to add them."
          games={lobby}
          gamesById={gamesById}
          onMove={(from, to) => changeLobby((current) => moveInList(current, from, to))}
          onRemove={toggle}
        />
      </Grid.Item>
    </Grid.Root>
  );
};
