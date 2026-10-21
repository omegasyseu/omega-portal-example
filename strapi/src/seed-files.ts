import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

/**
 * A refusal about the starter content that explains itself in its message (a bad flag, a
 * Strapi that isn't empty, IPS failing, a missing or broken seed file), so the seed prints
 * it without a stack and "Refresh from IPS" shows it to the admin. Anything else is a bug
 * or a Strapi failure and keeps its stack. Strapi's start-up step throws it too when the
 * starter Payment Methods file is broken.
 */
export class StarterContentError extends Error {
  name = 'StarterContentError';
}

/** The text of a seed file. One that can't be read is a StarterContentError naming it. */
export const readSeedText = (file: string): string => {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (error) {
    throw new StarterContentError(`Seed file ${file} can't be read: ${(error as Error).message}`);
  }
};

const readSeedJson = (file: string): unknown => {
  const text = readSeedText(file);
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new StarterContentError(`Seed file ${file} isn't valid JSON: ${(error as Error).message}`);
  }
};

/**
 * The content of a seed JSON file, checked against `schema`. A file that's missing, isn't
 * JSON or isn't that shape is a StarterContentError naming it.
 */
export const readSeedFile = <Schema extends z.ZodType>(file: string, schema: Schema): z.output<Schema> => {
  const parsed = schema.safeParse(readSeedJson(file));
  if (!parsed.success) {
    throw new StarterContentError(`Seed file ${file} isn't as expected:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
};

/**
 * The absolute path of an image in the seed folder. It's checked up front, so a broken seed
 * folder fails before anything is written to Strapi.
 */
export const seedImageAt = (...parts: string[]): string => {
  const file = path.join(...parts);
  if (!fs.existsSync(file)) {
    throw new StarterContentError(`Seed image missing: ${file}`);
  }
  return file;
};
