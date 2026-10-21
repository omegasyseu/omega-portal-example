import { memo, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Field,
  Flex,
  Searchbar,
  SingleSelect,
  SingleSelectOption,
  Typography,
} from '@strapi/design-system';
import { categoriesOf, filterGames, gameCount, type CatalogueFilter, type GameIds } from './lobby-selection';
import type { EditorGame } from './lobby-api';
import { GameLabel, GameTile } from './GameTile';

// SingleSelect needs a value for "All"; no Game Category can be this one.
const ALL_CATEGORIES = '\u0000all';
const NO_FILTER: CatalogueFilter = { category: null, search: '' };

type CataloguePanelProps = {
  /** The panel's heading: "Catalogue", or where a Collection's games come from. */
  title: string;
  /** Names the panel's fields, so two panels never share an ID. */
  name: string;
  games: readonly EditorGame[];
  /** The games ticked: the lobby's, or the Collection's. */
  picked: GameIds;
  onToggle: (documentId: string) => void;
  onSelectAll: (games: readonly EditorGame[]) => void;
  onClear: (games: readonly EditorGame[]) => void;
};

/**
 * Games to pick from, filtered by category and search, ticked when they're picked: the
 * whole catalogue for the lobby, or the lobby for one of its Collections.
 */
export const CataloguePanel = ({ title, name, games, picked, onToggle, onSelectAll, onClear }: CataloguePanelProps) => {
  const [filter, setFilter] = useState(NO_FILTER);
  const shown = useMemo(() => filterGames(games, filter), [games, filter]);
  const pickedIds = useMemo(() => new Set(picked), [picked]);

  return (
    <Box background="neutral0" hasRadius shadow="tableShadow" padding={6}>
      <Flex direction="column" alignItems="stretch" gap={4}>
        <Typography tag="h2" variant="delta">
          {title}
        </Typography>
        <CatalogueFilters name={name} games={games} filter={filter} onChange={setFilter} />
        <Flex justifyContent="space-between" gap={2}>
          <Typography variant="pi" textColor="neutral600">
            Showing {shown.length} of {gameCount(games.length)}
          </Typography>
          <Flex gap={2}>
            <Button variant="tertiary" size="S" disabled={shown.length === 0} onClick={() => onSelectAll(shown)}>
              Select all
            </Button>
            <Button variant="tertiary" size="S" disabled={shown.length === 0} onClick={() => onClear(shown)}>
              Clear
            </Button>
          </Flex>
        </Flex>
        <Box tag="ul" maxHeight="60vh" overflow="auto">
          {shown.map((game) => (
            <CatalogueRow
              key={game.documentId}
              checkboxId={`${name}-${game.documentId}`}
              game={game}
              isPicked={pickedIds.has(game.documentId)}
              onToggle={onToggle}
            />
          ))}
        </Box>
        {shown.length === 0 ? (
          <Typography textColor="neutral600">No games match. Change the search or the category.</Typography>
        ) : null}
      </Flex>
    </Box>
  );
};

type CatalogueFiltersProps = {
  name: string;
  games: readonly EditorGame[];
  filter: CatalogueFilter;
  onChange: Dispatch<SetStateAction<CatalogueFilter>>;
};

/** The search, and the Game Category to show (every one, or one of the games' categories). */
const CatalogueFilters = ({ name, games, filter, onChange }: CatalogueFiltersProps) => {
  const categories = useMemo(() => categoriesOf(games), [games]);
  return (
    <Flex gap={4} alignItems="flex-end" wrap="wrap">
      <Box flex="1" minWidth="200px">
        <Searchbar
          name={`${name}-search`}
          value={filter.search}
          onChange={(event) => onChange((current) => ({ ...current, search: event.target.value }))}
          onClear={() => onChange((current) => ({ ...current, search: '' }))}
          clearLabel="Clear the search"
          placeholder="Search by title, provider or game ID"
        >
          Search these games
        </Searchbar>
      </Box>
      <Field.Root name={`${name}-category`} width="200px">
        <Field.Label>Category</Field.Label>
        <SingleSelect
          value={filter.category ?? ALL_CATEGORIES}
          onChange={(value) =>
            onChange((current) => ({ ...current, category: value === ALL_CATEGORIES ? null : String(value) }))
          }
        >
          <SingleSelectOption value={ALL_CATEGORIES}>All</SingleSelectOption>
          {categories.map((category) => (
            <SingleSelectOption key={category} value={category}>
              {category}
            </SingleSelectOption>
          ))}
        </SingleSelect>
      </Field.Root>
    </Flex>
  );
};

type CatalogueRowProps = {
  checkboxId: string;
  game: EditorGame;
  isPicked: boolean;
  onToggle: (documentId: string) => void;
};

const CatalogueRow = memo(({ checkboxId, game, isPicked, onToggle }: CatalogueRowProps) => (
  <Box tag="li" borderColor="neutral150" borderStyle="solid" borderWidth="0 0 1px 0">
    <Flex tag="label" htmlFor={checkboxId} gap={3} paddingTop={2} paddingBottom={2} cursor="pointer">
      <Checkbox id={checkboxId} checked={isPicked} onCheckedChange={() => onToggle(game.documentId)} />
      <GameTile tileUrl={game.tileUrl} />
      <Box flex="1" minWidth={0}>
        <GameLabel game={game} />
      </Box>
      <Badge>{game.category}</Badge>
    </Flex>
  </Box>
));
