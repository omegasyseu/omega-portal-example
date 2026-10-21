import { Box, Flex, Switch, Typography } from '@strapi/design-system';
import { useField } from '@strapi/strapi/admin';
import {
  FEATURE_VISIBILITY,
  FEATURE_VISIBILITY_HINT,
  type FeatureKey,
  type FeatureVisibility,
  switchedOn,
} from '../../feature-visibility.ts';

// The props the content manager gives a custom field's input (only the ones used here).
// The value comes from the form itself: the version history view passes no value prop.
type Props = {
  name: string;
  disabled?: boolean;
};

const allSwitches = (value: FeatureVisibility) =>
  Object.fromEntries(FEATURE_VISIBILITY.map(({ key }) => [key, switchedOn(value, key)])) as Record<
    FeatureKey,
    boolean
  >;

/** A Brand's Feature visibility: one heading and hint, then a full-width switch per Engage Feature. */
export const FeatureVisibilityInput = ({ name, disabled }: Props) => {
  const { value, onChange } = useField<FeatureVisibility>(name);
  return (
    <Box>
      <Typography tag="h2" variant="delta">
        Feature visibility
      </Typography>
      <Box paddingTop={1} paddingBottom={4}>
        <Typography variant="pi" textColor="neutral600">
          {FEATURE_VISIBILITY_HINT}
        </Typography>
      </Box>
      <Flex direction="column" alignItems="stretch" gap={2}>
        {FEATURE_VISIBILITY.map(({ key, label }) => {
          const id = `${name}-${key}`;
          return (
            <Flex
              key={key}
              justifyContent="space-between"
              padding={3}
              background="neutral0"
              borderColor="neutral200"
              hasRadius
            >
              <Typography tag="label" htmlFor={id} variant="omega" fontWeight="semiBold">
                {label}
              </Typography>
              <Switch
                id={id}
                checked={switchedOn(value, key)}
                disabled={disabled}
                onCheckedChange={(checked) =>
                  onChange(name, { ...allSwitches(value), [key]: checked })
                }
              />
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};
