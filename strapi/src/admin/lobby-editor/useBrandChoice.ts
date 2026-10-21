import { useState } from 'react';

/**
 * Which Brand the Lobby editor edits. A Brand picked while the lobby has unsaved changes
 * waits as `pendingBrandId` until the editor discards them or keeps the current Brand.
 * `brandText` is the picker's text, put back to the current Brand when it's kept.
 */
export const useBrandChoice = (brandLabels: ReadonlyMap<string, string>) => {
  const [brandId, setBrandId] = useState<string | null>(null);
  const [pendingBrandId, setPendingBrandId] = useState<string | null>(null);
  const [brandText, setBrandText] = useState('');

  const choose = (nextBrandId: string, hasUnsavedChanges: boolean) => {
    if (nextBrandId === brandId) {
      return;
    }
    if (hasUnsavedChanges) {
      setPendingBrandId(nextBrandId);
    } else {
      setBrandId(nextBrandId);
    }
  };
  const keepCurrent = () => {
    setBrandText(brandLabels.get(brandId ?? '') ?? '');
    setPendingBrandId(null);
  };
  const switchToPending = () => {
    setBrandId(pendingBrandId);
    setPendingBrandId(null);
  };

  return { brandId, pendingBrandId, brandText, setBrandText, choose, keepCurrent, switchToPending };
};
