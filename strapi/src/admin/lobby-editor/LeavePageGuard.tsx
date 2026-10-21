import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { DiscardChangesDialog } from './DiscardChangesDialog';

/**
 * Warns before leaving the Lobby editor with unsaved changes: Strapi's own dialog for
 * a link inside the admin, and the browser's prompt for closing or reloading the tab.
 */
export const LeavePageGuard = ({ hasUnsavedChanges }: { hasUnsavedChanges: boolean }) => {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return undefined;
    }
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasUnsavedChanges]);

  return (
    <DiscardChangesDialog
      isOpen={blocker.state === 'blocked'}
      onDiscard={() => blocker.proceed?.()}
      onKeep={() => blocker.reset?.()}
    />
  );
};
