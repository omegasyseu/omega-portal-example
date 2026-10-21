import { Button, Dialog } from '@strapi/design-system';
import { ConfirmDialog } from '@strapi/strapi/admin';

type DiscardChangesDialogProps = {
  isOpen: boolean;
  onDiscard: () => void;
  onKeep: () => void;
};

/**
 * Asks before unsaved lobby changes are thrown away. Cancel, Escape and clicking outside
 * keep them. "Discard changes" isn't a closing Dialog.Action, so choosing it never also
 * counts as keeping them; the caller closes the dialog.
 */
export const DiscardChangesDialog = ({ isOpen, onDiscard, onKeep }: DiscardChangesDialogProps) => (
  <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onKeep()}>
    <ConfirmDialog
      title="Discard unsaved changes?"
      endAction={
        <Button fullWidth variant="danger-light" onClick={onDiscard}>
          Discard changes
        </Button>
      }
    >
      This lobby has changes you haven't saved. If you go on, they're lost.
    </ConfirmDialog>
  </Dialog.Root>
);
