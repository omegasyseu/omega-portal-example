import { Box, Combobox, ComboboxOption, Field, Flex } from '@strapi/design-system';
import { DocumentStatus } from '@strapi/content-manager/strapi-admin';
import type { PublicationStatus } from './lobby-api';

type BrandPickerProps = {
  /** Each Brand's label ("name (Brand ID n)") by its document ID, in list order. */
  brandLabels: ReadonlyMap<string, string>;
  brandId: string | null;
  status: PublicationStatus | null;
  /** The text in the picker. The page controls it so it can put the current Brand back. */
  text: string;
  onTextChange: (text: string) => void;
  onChoose: (brandId: string) => void;
};

/** Picks a Brand by searching its name or Brand ID, and shows its status the way the Content Manager does. */
export const BrandPicker = ({ brandLabels, brandId, status, text, onTextChange, onChoose }: BrandPickerProps) => (
  <Flex gap={4} alignItems="flex-end">
    <Field.Root name="brand" width="400px" hint="Search by name or Brand ID">
      <Field.Label>Brand</Field.Label>
      <Combobox
        value={brandId ?? undefined}
        onChange={(nextBrandId) => nextBrandId && onChoose(nextBrandId)}
        textValue={text}
        onTextValueChange={onTextChange}
        autocomplete={{ type: 'list', filter: 'contains' }}
        placeholder="Choose a Brand"
      >
        {[...brandLabels].map(([documentId, label]) => (
          <ComboboxOption key={documentId} value={documentId}>
            {label}
          </ComboboxOption>
        ))}
      </Combobox>
      <Field.Hint />
    </Field.Root>
    {status ? (
      // Lifts the badge level with the input, above the field's hint.
      <Box paddingBottom={7}>
        <DocumentStatus status={status} />
      </Box>
    ) : null}
  </Flex>
);
