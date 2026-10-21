import { Typography } from '@strapi/design-system';

/** Under a Game or Collection that was never published: the portal ignores it until it is. */
export const DraftNote = () => (
  <Typography tag="span" variant="pi" textColor="warning600" display="block">
    Draft — won't show until published
  </Typography>
);
