import {
  Badge,
  Box,
  Button,
  Field,
  Flex,
  IconButton,
  SingleSelect,
  SingleSelectOption,
  Typography,
} from '@strapi/design-system';
import { Cross } from '@strapi/icons';
import { gameCount, type BrandCollection } from './lobby-selection';
import type { EditorCollection } from './lobby-api';
import { DraftNote } from './DraftNote';
import { DraggableRow } from './DraggableRow';
import { useReorder } from './useReorder';

type CollectionsPanelProps = {
  /** The Collections the Brand shows, in the order of its menu and tabs. */
  brandCollections: readonly BrandCollection[];
  /** Every Collection an admin defined, by name. */
  collections: readonly EditorCollection[];
  /** The Collection whose games are being picked, if any. */
  pickedId: string | null;
  onAdd: (collectionId: string) => void;
  onMove: (from: number, to: number) => void;
  onRemove: (collectionId: string) => void;
  onPick: (collectionId: string) => void;
};

/**
 * The Collections a Brand shows, in the order of its menu and its Games page tabs: add one
 * from the Collections an admin defined, drag or use the arrow keys to reorder, remove
 * one, or pick one to choose its games.
 */
export const CollectionsPanel = ({ brandCollections, collections, onAdd, ...listProps }: CollectionsPanelProps) => {
  const shownIds = brandCollections.map((collection) => collection.collectionId);
  const addable = collections.filter((collection) => !shownIds.includes(collection.documentId));

  return (
    <Box background="neutral0" hasRadius shadow="tableShadow" padding={6}>
      <Flex direction="column" alignItems="stretch" gap={4}>
        <Flex justifyContent="space-between" alignItems="flex-end" gap={4} wrap="wrap">
          <Flex gap={2}>
            <Typography tag="h2" variant="delta">
              Collections
            </Typography>
            <Badge>{brandCollections.length}</Badge>
          </Flex>
          <AddCollectionField addable={addable} onAdd={onAdd} />
        </Flex>
        <NoCollectionsNotice hasCollections={collections.length > 0} showsNone={brandCollections.length === 0} />
        {brandCollections.length > 0 ? (
          <BrandCollectionList brandCollections={brandCollections} collections={collections} {...listProps} />
        ) : null}
      </Flex>
    </Box>
  );
};

type AddCollectionFieldProps = {
  /** The Collections the Brand doesn't show yet. */
  addable: readonly EditorCollection[];
  onAdd: (collectionId: string) => void;
};

/** Picking a Collection here adds it to the Brand, so the field always stays empty. */
const AddCollectionField = ({ addable, onAdd }: AddCollectionFieldProps) => (
  <Field.Root name="add-collection" width="280px">
    <Field.Label>Add a Collection</Field.Label>
    <SingleSelect
      value=""
      placeholder={addable.length > 0 ? 'Choose a Collection' : 'Every Collection is added'}
      disabled={addable.length === 0}
      onChange={(value) => onAdd(String(value))}
    >
      {addable.map((collection) => (
        <SingleSelectOption key={collection.documentId} value={collection.documentId}>
          {collection.name}
        </SingleSelectOption>
      ))}
    </SingleSelect>
  </Field.Root>
);

/** Why the list is empty: no Collection is defined yet, or the Brand shows none. */
const NoCollectionsNotice = ({ hasCollections, showsNone }: { hasCollections: boolean; showsNone: boolean }) => {
  if (!hasCollections) {
    return (
      <Typography textColor="neutral600">
        No Collections yet. Create them under Content Manager → Collection, then add them here.
      </Typography>
    );
  }
  return showsNone ? (
    <Typography textColor="neutral600">
      This Brand shows no Collections, so its menu and Games page show All Games only.
    </Typography>
  ) : null;
};

type BrandCollectionListProps = Omit<CollectionsPanelProps, 'onAdd'>;

/** The Brand's Collections, to reorder, remove or pick. */
const BrandCollectionList = ({
  brandCollections,
  collections,
  pickedId,
  onMove,
  ...rowProps
}: BrandCollectionListProps) => {
  const reorder = useReorder(
    brandCollections.map((collection) => collection.collectionId),
    onMove,
  );
  const byId = new Map(collections.map((collection) => [collection.documentId, collection]));
  return (
    <Box tag="ol">
      {brandCollections.map((brandCollection, index) => {
        const collection = byId.get(brandCollection.collectionId);
        return (
          <DraggableRow
            key={brandCollection.collectionId}
            index={index}
            name={collection?.name ?? brandCollection.collectionId}
            reorder={reorder}
          >
            <CollectionRow
              brandCollection={brandCollection}
              collection={collection}
              isPicked={brandCollection.collectionId === pickedId}
              {...rowProps}
            />
          </DraggableRow>
        );
      })}
    </Box>
  );
};

type CollectionRowProps = {
  brandCollection: BrandCollection;
  collection: EditorCollection | undefined;
  isPicked: boolean;
  onRemove: (collectionId: string) => void;
  onPick: (collectionId: string) => void;
};

/** One of the Brand's Collections, after its handle: name, slug and icon, game count, and actions. */
const CollectionRow = ({ brandCollection, collection, isPicked, onRemove, onPick }: CollectionRowProps) => {
  const { collectionId, games } = brandCollection;
  const name = collection?.name ?? collectionId;
  return (
    <>
      <Box flex="1" minWidth={0}>
        <Typography tag="span" variant="omega" fontWeight="semiBold" display="block" ellipsis>
          {name}
        </Typography>
        {collection ? (
          <Typography tag="span" variant="pi" textColor="neutral600" display="block" ellipsis>
            /games?collection={collection.slug}, {collection.icon} icon
          </Typography>
        ) : null}
        {collection?.isDraft ? <DraftNote /> : null}
      </Box>
      <Badge>{gameCount(games.length)}</Badge>
      <Button
        variant={isPicked ? 'secondary' : 'tertiary'}
        size="S"
        aria-pressed={isPicked}
        onClick={() => onPick(collectionId)}
      >
        {isPicked ? 'Choosing games' : 'Choose games'}
      </Button>
      <IconButton variant="ghost" label={`Remove ${name} from this Brand`} onClick={() => onRemove(collectionId)}>
        <Cross />
      </IconButton>
    </>
  );
};
