import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Dialog, Flex, Typography } from '@strapi/design-system';
import { ArrowClockwise } from '@strapi/icons';
import {
  ConfirmDialog,
  isFetchError,
  useAPIErrorHandler,
  useFetchClient,
  useNotification,
  useRBAC,
} from '@strapi/strapi/admin';
import { BRAND_UID } from '../../uids.ts';
import { REFRESH_PERMISSIONS } from '../../brand-permissions.ts';
import type { RefreshSummary } from '../../brand-refresh.ts';

/**
 * "Refresh from IPS" on the Brand list: adds a published starter Brand for every brand IPS
 * lists that Strapi has none for and gives Brands with no Legal Pages the seed's
 * (src/brand-refresh.ts), then shows what it did. Shown only
 * on the Brand list, to roles that may create and publish Brands.
 */
export const RefreshFromIpsButton = () => {
  const { slug } = useParams<{ slug: string }>();
  const { allowedActions } = useRBAC(REFRESH_PERMISSIONS);
  if (slug !== BRAND_UID || !allowedActions.canCreate || !allowedActions.canPublish) return null;
  return <RefreshFromIps />;
};

const RefreshFromIps = () => {
  const client = useFetchClient();
  const { toggleNotification } = useNotification();
  const { formatAPIError } = useAPIErrorHandler();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState<RefreshSummary | null>(null);

  const refresh = async () => {
    setIsConfirming(false);
    setIsRefreshing(true);
    try {
      const { data } = await client.post<RefreshSummary>('/brand-refresh');
      setSummary(data);
    } catch (error) {
      console.error('Refresh from IPS:', error);
      toggleNotification({
        type: 'danger',
        message: isFetchError(error) ? formatAPIError(error) : 'Refresh from IPS failed. Try again.',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const closeSummary = () => {
    // shortcut: reloads the page so the list shows the new Brands; invalidate the content
    // manager's list query instead if Strapi ever exports a way to.
    if (summary !== null && summary.added.length > 0) window.location.reload();
    setSummary(null);
  };

  return (
    <>
      <Button
        variant="secondary"
        startIcon={<ArrowClockwise />}
        loading={isRefreshing}
        onClick={() => setIsConfirming(true)}
      >
        Refresh from IPS
      </Button>
      <Dialog.Root open={isConfirming} onOpenChange={setIsConfirming}>
        <ConfirmDialog
          title="Add IPS's new brands?"
          endAction={
            <Button fullWidth onClick={refresh}>
              Add new brands
            </Button>
          }
        >
          Every brand IPS lists that has no Brand here gets one, published immediately, with the seed's starter
          content. A Brand with no Legal Pages gets the seed's, in its name; nothing else of an existing Brand
          changes. Keep this page open until it finishes.
        </ConfirmDialog>
      </Dialog.Root>
      <Dialog.Root open={summary !== null} onOpenChange={(open) => !open && closeSummary()}>
        {summary !== null ? <SummaryDialog summary={summary} /> : null}
      </Dialog.Root>
    </>
  );
};

const SummaryDialog = ({ summary }: { summary: RefreshSummary }) => (
  <Dialog.Content>
    <Dialog.Header>Refreshed from IPS</Dialog.Header>
    <Dialog.Body>
      <Flex direction="column" alignItems="stretch" gap={4} width="100%">
        <SummaryList
          title={`Added and published (${summary.added.length})`}
          empty="No new brands in IPS."
          brands={summary.added}
        />
        <SummaryList
          title={`Given the starter Legal Pages (${summary.legalPagesAdded.length})`}
          empty="Every Brand already has Legal Pages."
          brands={summary.legalPagesAdded}
          note="Nothing else of these Brands changed. Review the pages and replace the starter text."
        />
        <Typography>{summary.existing.length} already had a Brand.</Typography>
        <SummaryList
          title={`In Strapi but not in IPS (${summary.notInIps.length})`}
          empty="Every Brand here is in IPS."
          brands={summary.notInIps}
          note="These were kept. Delete them yourself if they're gone for good."
        />
      </Flex>
    </Dialog.Body>
    <Dialog.Footer>
      <Dialog.Cancel>
        <Button fullWidth variant="tertiary">
          Close
        </Button>
      </Dialog.Cancel>
    </Dialog.Footer>
  </Dialog.Content>
);

type SummaryListProps = { title: string; empty: string; brands: RefreshSummary['notInIps']; note?: string };

const SummaryList = ({ title, empty, brands, note }: SummaryListProps) => (
  <Flex direction="column" alignItems="stretch" gap={2}>
    <Typography variant="delta" tag="h3">
      {title}
    </Typography>
    {brands.length === 0 ? (
      <Typography textColor="neutral600">{empty}</Typography>
    ) : (
      <>
        <Flex tag="ul" direction="column" alignItems="stretch" gap={1}>
          {brands.map(({ brandId, name }, index) => (
            // The summary never changes, and two Brands may share a name or lack a Brand ID.
            <Flex
              key={index}
              tag="li"
              justifyContent="space-between"
              gap={4}
              background="neutral100"
              hasRadius
              paddingTop={2}
              paddingBottom={2}
              paddingLeft={3}
              paddingRight={3}
            >
              <Typography fontWeight="semiBold">{name ?? 'Unnamed'}</Typography>
              {brandId === null ? null : <Typography textColor="neutral600">Brand ID {brandId}</Typography>}
            </Flex>
          ))}
        </Flex>
        {note ? <Typography textColor="neutral600">{note}</Typography> : null}
      </>
    )}
  </Flex>
);
