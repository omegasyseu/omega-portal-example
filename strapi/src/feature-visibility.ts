/**
 * A Brand's Feature visibility: a switch per Engage Feature, stored as one JSON field
 * (`featureVisibility`) that the admin shows as a panel of switches
 * (src/admin/feature-visibility/FeatureVisibilityInput.tsx). The portal reads these keys;
 * a switch that isn't saved, or a Brand with no value at all, counts as on.
 */
export const FEATURE_VISIBILITY = [
  { key: 'jackpot', label: 'Jackpot' },
  { key: 'challenge', label: 'Challenge' },
  { key: 'levelUp', label: 'Level Up' },
  { key: 'quest', label: 'Quest' },
  { key: 'leaderboard', label: 'Leaderboard' },
] as const;

export type FeatureKey = (typeof FEATURE_VISIBILITY)[number]['key'];

export type FeatureVisibility = Partial<Record<FeatureKey, boolean | null>> | null | undefined;

export const FEATURE_VISIBILITY_HINT =
  "Switch a feature off to hide every link, widget and banner into it on this Brand's pages. Its page still opens by direct link.";

/** The custom field both the server and the admin register (as `global::feature-visibility`). */
export const FEATURE_VISIBILITY_FIELD = { name: 'feature-visibility', type: 'json' } as const;

export const switchedOn = (visibility: FeatureVisibility, key: FeatureKey): boolean =>
  visibility?.[key] !== false;
