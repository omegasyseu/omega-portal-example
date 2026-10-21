import type { ReactNode } from 'react';
import { Box, Flex, IconButton, Typography } from '@strapi/design-system';
import { Drag } from '@strapi/icons';
import type { Reorder } from './useReorder';

type DraggableRowProps = {
  index: number;
  /** What the row holds, for the move handle's label. */
  name: string;
  reorder: Reorder;
  children: ReactNode;
};

/**
 * One row of a list the editor reorders: dragged anywhere, or moved with the arrow keys on
 * its handle, with its position after the handle and the row's own content after that.
 */
export const DraggableRow = ({ index, name, reorder, children }: DraggableRowProps) => (
  <Box
    tag="li"
    background={reorder.isDropTarget(index) ? 'primary100' : undefined}
    borderColor="neutral150"
    borderStyle="solid"
    borderWidth="0 0 1px 0"
    {...reorder.dragHandlers(index)}
  >
    <Flex gap={3} paddingTop={2} paddingBottom={2}>
      <IconButton
        variant="ghost"
        label={`Move ${name}: drag, or press the up and down arrow keys`}
        withTooltip={false}
        onKeyDown={reorder.moveWithKeys(index)}
        style={{ cursor: 'grab' }}
      >
        <Drag />
      </IconButton>
      <Typography variant="pi" textColor="neutral600" style={{ minWidth: '2ch', textAlign: 'right' }}>
        {index + 1}
      </Typography>
      {children}
    </Flex>
  </Box>
);
