import { useMemo, useState } from 'react';
import { Flex, Grid } from '@strapi/design-system';
import {
  addCollection,
  clearGames,
  moveCollection,
  moveInList,
  removeCollection,
  selectGames,
  toggleGame,
  withCollectionGames,
  type BrandCollection,
  type BrandSelection,
  type CollectionGames,
} from './lobby-selection';
import type { EditorCollection, EditorGame } from './lobby-api';
import { CataloguePanel } from './CataloguePanel';
import { CollectionsPanel } from './CollectionsPanel';
import { GameListPanel } from './GameListPanel';

type ChangeSelection = (change: (current: BrandSelection) => BrandSelection) => void;

type CollectionsEditorProps = {
  selection: BrandSelection;
  gamesById: ReadonlyMap<string, EditorGame>;
  collections: readonly EditorCollection[];
  collectionsById: ReadonlyMap<string, EditorCollection>;
  onChange: ChangeSelection;
};

/**
 * The Brand's Collections, and the games of the one being picked: chosen from the Brand's
 * lobby, with the same search, category filter and Select all as the catalogue.
 */
export const CollectionsEditor = ({
  selection,
  gamesById,
  collections,
  collectionsById,
  onChange,
}: CollectionsEditorProps) => {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const picked = selection.collections.find((collection) => collection.collectionId === pickedId);
  const lobbyGames = useMemo(
    () => selection.lobby.flatMap((documentId) => gamesById.get(documentId) ?? []),
    [selection.lobby, gamesById],
  );

  return (
    <Flex direction="column" alignItems="stretch" gap={4} paddingTop={4}>
      <CollectionsPanel
        brandCollections={selection.collections}
        collections={collections}
        pickedId={picked?.collectionId ?? null}
        onAdd={(collectionId) => {
          onChange((current) => addCollection(current, collectionId));
          setPickedId(collectionId);
        }}
        onMove={(from, to) => onChange((current) => moveCollection(current, from, to))}
        onRemove={(collectionId) => onChange((current) => removeCollection(current, collectionId))}
        onPick={setPickedId}
      />
      {picked ? (
        <CollectionGamesPicker
          picked={picked}
          name={collectionsById.get(picked.collectionId)?.name ?? 'This Collection'}
          lobbyGames={lobbyGames}
          gamesById={gamesById}
          onChange={onChange}
        />
      ) : null}
    </Flex>
  );
};

type CollectionGamesPickerProps = {
  picked: BrandCollection;
  name: string;
  lobbyGames: readonly EditorGame[];
  gamesById: ReadonlyMap<string, EditorGame>;
  onChange: ChangeSelection;
};

/** The picked Collection's games: ticked from the Brand's lobby, and their order. */
const CollectionGamesPicker = ({ picked, name, lobbyGames, gamesById, onChange }: CollectionGamesPickerProps) => {
  const { collectionId } = picked;
  const changeGames = (change: (games: CollectionGames) => CollectionGames) =>
    onChange((current) => {
      const games = current.collections.find((collection) => collection.collectionId === collectionId)?.games;
      return withCollectionGames(current, collectionId, change(games ?? []));
    });

  return (
    <Grid.Root gap={4}>
      <Grid.Item col={7} s={12} alignItems="stretch" direction="column">
        <CataloguePanel
          title={'Lobby games for ' + name}
          name="collection-games"
          games={lobbyGames}
          picked={picked.games}
          onToggle={(documentId) => changeGames((games) => toggleGame(games, documentId))}
          onSelectAll={(shown) => changeGames((games) => selectGames(games, shown))}
          onClear={(shown) => changeGames((games) => clearGames(games, shown))}
        />
      </Grid.Item>
      <Grid.Item col={5} s={12} alignItems="stretch" direction="column">
        <GameListPanel
          title={name}
          emptyText="No games yet. Tick games from the lobby to add them. Until then, the portal shows this Collection's link and an empty tab."
          games={picked.games}
          gamesById={gamesById}
          onMove={(from, to) => changeGames((games) => moveInList(games, from, to))}
          onRemove={(documentId) => changeGames((games) => toggleGame(games, documentId))}
        />
      </Grid.Item>
    </Grid.Root>
  );
};
