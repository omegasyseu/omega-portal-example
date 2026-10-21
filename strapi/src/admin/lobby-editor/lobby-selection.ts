/** A Game in the catalogue, as the Lobby editor lists it. */
export type CatalogueGame = {
  documentId: string;
  title: string;
  provider: string;
  gameId: string;
  category: string;
};

/** Which catalogue games are shown: one category (or every one, when null) and a search. */
export type CatalogueFilter = {
  category: string | null;
  search: string;
};

/** Picked games' document IDs, in order: a Brand's lobby, or one of its Collection's games. */
export type GameIds = readonly string[];

/** A Brand's lobby: its Games' document IDs, in the order the portal shows them. */
export type Lobby = GameIds;

/** The games one of a Brand's Collections holds, from its lobby, in the Collection's order. */
export type CollectionGames = GameIds;

/** Ticks or unticks one game: a newly ticked game goes at the end. */
export const toggleGame = (games: GameIds, documentId: string): GameIds =>
  games.includes(documentId) ? games.filter((id) => id !== documentId) : [...games, documentId];

/**
 * Moves the item at one position to another, shifting the items between. A move off either
 * end does nothing. It moves games and a Brand's Collections alike.
 */
export const moveInList = <Item>(list: readonly Item[], from: number, to: number): readonly Item[] => {
  const isInList = (index: number) => index >= 0 && index < list.length;
  if (!isInList(from) || !isInList(to)) {
    return list;
  }
  const rest = list.filter((_, index) => index !== from);
  return [...rest.slice(0, to), list[from], ...rest.slice(to)];
};

/** "Select all": adds the given games that aren't picked yet at the end, in the order given. */
export const selectGames = (picked: GameIds, games: readonly CatalogueGame[]): GameIds => {
  const isPicked = new Set(picked);
  return [...picked, ...games.map((game) => game.documentId).filter((id) => !isPicked.has(id))];
};

/** "Clear": unpicks the given games and keeps the rest in order. */
export const clearGames = (picked: GameIds, games: readonly CatalogueGame[]): GameIds => {
  const cleared = new Set(games.map((game) => game.documentId));
  return picked.filter((id) => !cleared.has(id));
};

/** How the editor counts games: "1 game", "12 games". */
export const gameCount = (count: number): string => (count === 1 ? '1 game' : `${count} games`);

/** Whether one list of games differs from another, in its games or their order. */
export const hasListChanged = (saved: GameIds, current: GameIds): boolean =>
  saved.length !== current.length || saved.some((id, index) => id !== current[index]);

const relationSet = (documentIds: readonly string[]) => ({ set: documentIds.map((documentId) => ({ documentId })) });

/**
 * The body that saves a lobby through the content manager. It holds only the lobby, so
 * no other Brand field changes, and `set` replaces the whole relation in this order.
 */
export const lobbyUpdate = (lobby: Lobby) => ({ lobby: relationSet(lobby) });

/** The categories the catalogue uses, each once, in alphabetical order. */
export const categoriesOf = (games: readonly CatalogueGame[]): string[] =>
  [...new Set(games.map((game) => game.category))].sort((a, b) => a.localeCompare(b));

/** The text a search matches: the title, and the key `PROVIDER:gameId` the portal uses. */
const searchableText = (game: CatalogueGame): string => `${game.title}\n${game.provider}:${game.gameId}`.toLowerCase();

/** The catalogue games that match the filter, in catalogue order. */
export const filterGames = <Game extends CatalogueGame>(games: readonly Game[], filter: CatalogueFilter): Game[] => {
  const search = filter.search.trim().toLowerCase();
  return games.filter(
    (game) =>
      (filter.category === null || game.category === filter.category) && searchableText(game).includes(search),
  );
};

/** One Collection the Brand shows: the Collection's document ID and its games' document IDs, in order. */
export type BrandCollection = { collectionId: string; games: CollectionGames };

/** What the Lobby editor edits for one Brand: its lobby and the Collections it shows, in order. */
export type BrandSelection = { lobby: Lobby; collections: readonly BrandCollection[] };

/**
 * Sets the lobby. A game taken out of it also leaves every Collection, since a Collection
 * only picks from the lobby; Strapi refuses anything else (src/brand-collections.ts).
 */
export const withLobby = (selection: BrandSelection, lobby: Lobby): BrandSelection => {
  const inLobby = new Set(lobby);
  return {
    lobby,
    collections: selection.collections.map((collection) => ({
      ...collection,
      games: collection.games.filter((id) => inLobby.has(id)),
    })),
  };
};

/** Adds a Collection at the end, holding no games yet. One the Brand already shows stays where it is. */
export const addCollection = (selection: BrandSelection, collectionId: string): BrandSelection =>
  selection.collections.some((collection) => collection.collectionId === collectionId)
    ? selection
    : { ...selection, collections: [...selection.collections, { collectionId, games: [] }] };

export const removeCollection = (selection: BrandSelection, collectionId: string): BrandSelection => ({
  ...selection,
  collections: selection.collections.filter((collection) => collection.collectionId !== collectionId),
});

/** Moves the Collection at one position to another. A move off either end does nothing. */
export const moveCollection = (selection: BrandSelection, from: number, to: number): BrandSelection => ({
  ...selection,
  collections: moveInList(selection.collections, from, to),
});

/** Sets the games one Collection holds, in order. They come from the lobby. */
export const withCollectionGames = (
  selection: BrandSelection,
  collectionId: string,
  games: CollectionGames,
): BrandSelection => ({
  ...selection,
  collections: selection.collections.map((collection) =>
    collection.collectionId === collectionId ? { ...collection, games } : collection,
  ),
});

/** A game that saving takes out of Collections, because it left the lobby, and those Collections. */
export type GameLeavingCollections = { documentId: string; collectionIds: string[] };

/** The games in a saved Collection that the lobby on screen no longer lists, so saving takes them out. */
export const gamesLeavingCollections = (saved: BrandSelection, current: BrandSelection): GameLeavingCollections[] => {
  const inLobby = new Set(current.lobby);
  const leaving = saved.lobby.filter((id) => !inLobby.has(id));
  return leaving.flatMap((documentId) => {
    const collectionIds = saved.collections
      .filter((collection) => collection.games.includes(documentId))
      .map((collection) => collection.collectionId);
    return collectionIds.length > 0 ? [{ documentId, collectionIds }] : [];
  });
};

/** Whether the selection on screen differs from the saved one: the lobby, the Collections, their order or their games. */
export const hasUnsavedSelectionChanges = (saved: BrandSelection, current: BrandSelection): boolean =>
  hasListChanged(saved.lobby, current.lobby) ||
  saved.collections.length !== current.collections.length ||
  saved.collections.some(
    (collection, index) =>
      collection.collectionId !== current.collections[index].collectionId ||
      hasListChanged(collection.games, current.collections[index].games),
  );

/**
 * The body that saves the selection through the content manager: the lobby and the whole
 * list of Collections, each relation as a `set` in this order, so no other Brand field
 * changes and the order is kept.
 */
export const brandUpdate = (selection: BrandSelection) => ({
  ...lobbyUpdate(selection.lobby),
  collections: selection.collections.map((collection) => ({
    collection: relationSet([collection.collectionId]),
    games: relationSet(collection.games),
  })),
});
