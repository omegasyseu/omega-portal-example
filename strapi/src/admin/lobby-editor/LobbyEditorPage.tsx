import { useEffect, useMemo, useState } from 'react';
import { Button, Flex, Loader, Tabs } from '@strapi/design-system';
import { Layouts, Page, useFetchClient, useRBAC } from '@strapi/strapi/admin';
import { gamesLeavingCollections } from './lobby-selection';
import {
  fetchBrands,
  fetchCatalogue,
  fetchCollections,
  type BrandSummary,
  type EditorCollection,
  type EditorGame,
} from './lobby-api';
import { BRAND_PERMISSIONS } from '../../brand-permissions.ts';
import { useBrandChoice } from './useBrandChoice';
import { useBrandLobby, type BrandLobby } from './useBrandLobby';
import { BrandPicker } from './BrandPicker';
import { CollectionsEditor } from './CollectionsEditor';
import { LobbyTab } from './LobbyTab';
import { LeavingCollectionsNotice } from './LeavingCollectionsNotice';
import { LeavePageGuard } from './LeavePageGuard';
import { DiscardChangesDialog } from './DiscardChangesDialog';

type LoadedContent = { games: EditorGame[]; brands: BrandSummary[]; collections: EditorCollection[] };

/**
 * The Lobby editor: pick a Brand, choose its lobby's games from the catalogue and order
 * them, choose its Collections and each one's games from the lobby, then save or publish.
 */
const LobbyEditorPage = () => (
  <Page.Protect permissions={[BRAND_PERMISSIONS.update]}>
    <Page.Title>Lobby editor</Page.Title>
    <LobbyEditor />
  </Page.Protect>
);

const LobbyEditor = () => {
  const client = useFetchClient();
  const [content, setContent] = useState<LoadedContent | null>(null);
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    Promise.all([fetchCatalogue(client), fetchBrands(client), fetchCollections(client)])
      .then(([games, brands, collections]) => setContent({ games, brands, collections }))
      .catch((error) => {
        console.error('Lobby editor: the catalogue, the Brands or the Collections could not be loaded.', error);
        setHasLoadError(true);
      });
  }, [client]);

  if (hasLoadError) {
    return <Page.Error />;
  }
  if (content === null) {
    return <Page.Loading />;
  }
  return <LobbyEditorForm games={content.games} brands={content.brands} collections={content.collections} />;
};

const LobbyEditorForm = ({ games, brands, collections }: LoadedContent) => {
  const brandLabels = useMemo(
    () => new Map(brands.map((brand) => [brand.documentId, `${brand.name} (Brand ID ${brand.brandId})`])),
    [brands],
  );
  const choice = useBrandChoice(brandLabels);
  const brandLobby = useBrandLobby(choice.brandId);
  const { allowedActions } = useRBAC([BRAND_PERMISSIONS.publish]);

  return (
    <Page.Main>
      <LeavePageGuard hasUnsavedChanges={brandLobby.hasUnsavedChanges} />
      <DiscardChangesDialog
        isOpen={choice.pendingBrandId !== null}
        onDiscard={choice.switchToPending}
        onKeep={choice.keepCurrent}
      />
      <Layouts.Header
        title="Lobby editor"
        subtitle="Choose the games in a Brand's lobby, the Collections it shows, and the order of each."
        primaryAction={
          choice.brandId ? <EditorActions brandLobby={brandLobby} canPublish={allowedActions.canPublish} /> : undefined
        }
      />
      <Layouts.Content>
        <Flex direction="column" alignItems="stretch" gap={6}>
          <BrandPicker
            brandLabels={brandLabels}
            brandId={choice.brandId}
            status={brandLobby.status}
            text={choice.brandText}
            onTextChange={choice.setBrandText}
            onChoose={(brandId) => choice.choose(brandId, brandLobby.hasUnsavedChanges)}
          />
          {choice.brandId !== null && brandLobby.isLoading ? <Loader>Loading the lobby</Loader> : null}
          {choice.brandId !== null && !brandLobby.isLoading ? (
            <SelectionTabs games={games} collections={collections} brandLobby={brandLobby} />
          ) : null}
        </Flex>
      </Layouts.Content>
    </Page.Main>
  );
};

/** Save, and Publish for a role that may publish Brands. */
const EditorActions = ({ brandLobby, canPublish }: { brandLobby: BrandLobby; canPublish: boolean }) => {
  const isBusy = brandLobby.isLoading || brandLobby.isSubmitting;
  return (
    <Flex gap={2}>
      <Button variant="secondary" disabled={!brandLobby.hasUnsavedChanges || isBusy} onClick={brandLobby.save}>
        Save
      </Button>
      {canPublish ? (
        // Publish stays on for a published Brand: a lobby Game published after the Brand only
        // reaches players once the Brand is published again (README.md, "Lobby editor").
        <Button disabled={isBusy} onClick={brandLobby.publish}>
          Publish
        </Button>
      ) : null}
    </Flex>
  );
};

type SelectionTabsProps = Pick<LoadedContent, 'games' | 'collections'> & { brandLobby: BrandLobby };

/** The loaded Brand's lobby and Collections, a tab each, under a notice of games that saving takes out of Collections. */
const SelectionTabs = ({ games, collections, brandLobby }: SelectionTabsProps) => {
  const { selection, savedSelection, setSelection } = brandLobby;
  const gamesById = useMemo(() => new Map(games.map((game) => [game.documentId, game])), [games]);
  const collectionsById = useMemo(
    () => new Map(collections.map((collection) => [collection.documentId, collection])),
    [collections],
  );
  const leaving = gamesLeavingCollections(savedSelection, selection);

  return (
    <>
      <LeavingCollectionsNotice leaving={leaving} gamesById={gamesById} collectionsById={collectionsById} />
      <Tabs.Root defaultValue="lobby">
        <Tabs.List aria-label="What to edit">
          <Tabs.Trigger value="lobby">Lobby</Tabs.Trigger>
          <Tabs.Trigger value="collections">Collections</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="lobby">
          <LobbyTab games={games} gamesById={gamesById} lobby={selection.lobby} onChange={setSelection} />
        </Tabs.Content>
        <Tabs.Content value="collections">
          <CollectionsEditor
            selection={selection}
            gamesById={gamesById}
            collections={collections}
            collectionsById={collectionsById}
            onChange={setSelection}
          />
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
};

export default LobbyEditorPage;
