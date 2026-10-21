import { useCallback, useEffect, useState } from 'react';
import { isFetchError, useAPIErrorHandler, useFetchClient, useNotification } from '@strapi/strapi/admin';
import { hasUnsavedSelectionChanges, type BrandSelection } from './lobby-selection';
import { fetchBrandSelection, publishSelection, saveSelection, type PublicationStatus } from './lobby-api';

const EMPTY_SELECTION: BrandSelection = { lobby: [], collections: [] };

/**
 * One Brand's lobby and Collections: the saved ones, the ones being edited, the Brand's
 * status, and Save and Publish.
 */
export const useBrandLobby = (brandId: string | null) => {
  const client = useFetchClient();
  const { toggleNotification } = useNotification();
  const { formatAPIError } = useAPIErrorHandler();
  const [savedSelection, setSavedSelection] = useState<BrandSelection>(EMPTY_SELECTION);
  const [selection, setSelection] = useState<BrandSelection>(EMPTY_SELECTION);
  const [status, setStatus] = useState<PublicationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showError = useCallback(
    (error: unknown) => {
      console.error('Lobby editor:', error);
      toggleNotification({
        type: 'danger',
        message: isFetchError(error) ? formatAPIError(error) : 'Something went wrong with this lobby. Try again.',
      });
    },
    [toggleNotification, formatAPIError],
  );

  useEffect(() => {
    setSavedSelection(EMPTY_SELECTION);
    setSelection(EMPTY_SELECTION);
    setStatus(null);
    if (brandId === null) {
      return undefined;
    }
    let isCurrent = true;
    setIsLoading(true);
    fetchBrandSelection(client, brandId)
      .then((loaded) => {
        if (isCurrent) {
          setSavedSelection(loaded.selection);
          setSelection(loaded.selection);
          setStatus(loaded.status);
        }
      })
      .catch((error) => isCurrent && showError(error))
      .finally(() => isCurrent && setIsLoading(false));
    return () => {
      isCurrent = false;
    };
  }, [brandId, client, showError]);

  const submit = async (send: typeof saveSelection, successMessage: string) => {
    if (brandId === null) {
      return;
    }
    setIsSubmitting(true);
    try {
      setStatus(await send(client, brandId, selection));
      setSavedSelection(selection);
      toggleNotification({ type: 'success', message: successMessage });
    } catch (error) {
      showError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selection,
    savedSelection,
    setSelection,
    status,
    isLoading,
    isSubmitting,
    hasUnsavedChanges: hasUnsavedSelectionChanges(savedSelection, selection),
    save: () => submit(saveSelection, 'Saved as a draft'),
    publish: () => submit(publishSelection, 'Published'),
  };
};

/** One Brand's lobby and Collections as the Lobby editor holds them (useBrandLobby). */
export type BrandLobby = ReturnType<typeof useBrandLobby>;
