import fs from 'node:fs';
import path from 'node:path';
import type { Core } from '@strapi/strapi';
import { StarterContentError } from './seed-files.ts';

const MIME_TYPES: Record<string, string> = { '.avif': 'image/avif', '.png': 'image/png' };

type UploadService = { upload: (input: unknown) => Promise<Array<{ id: number }>> };

/**
 * Returns a function that uploads each seed image file once and gives its media id; the
 * logo and banners are shared by every Brand.
 */
export const mediaUploader = (strapi: Core.Strapi) => {
  const uploaded = new Map<string, number>();
  return async (file: string, alternativeText: string | null = null): Promise<number> => {
    if (!uploaded.has(file)) {
      const mimetype = MIME_TYPES[path.extname(file)];
      if (!mimetype) {
        throw new StarterContentError(`Seed image ${file} is not an AVIF or PNG file.`);
      }
      const upload = strapi.plugin('upload').service('upload') as UploadService;
      const [media] = await upload.upload({
        data: { fileInfo: { alternativeText } },
        files: { filepath: file, originalFilename: path.basename(file), mimetype, size: fs.statSync(file).size },
      });
      uploaded.set(file, media.id);
    }
    return uploaded.get(file) as number;
  };
};

type Upload = ReturnType<typeof mediaUploader>;
type SeedBanner = { title: string; buttonText: string; link: string; image: string };

/**
 * The media ids of a starter Brand's logo and banners, which every starter Brand shares.
 * An image the Media Library already holds under the file's name is reused, so "Refresh
 * from IPS" never uploads them again; a missing one (never uploaded, or deleted by an
 * editor) is uploaded. Only these files are matched by name: two seed tiles share a name.
 * shortcut: matches by file name only, so an editor's own upload with the logo's or a
 * banner's file name is reused too; compare contents if that ever matters.
 */
export const starterMedia = async (
  strapi: Core.Strapi,
  upload: Upload,
  { logo, banners }: { logo: string; banners: SeedBanner[] },
) => {
  const mediaId = async (file: string) => {
    const existing = await strapi.db
      .query('plugin::upload.file')
      .findOne({ where: { name: path.basename(file) }, select: ['id'] });
    return existing ? (existing.id as number) : upload(file);
  };
  const logoId = await mediaId(logo);
  const bannersWithIds = [];
  for (const { image, ...banner } of banners) {
    bannersWithIds.push({ ...banner, image: await mediaId(image) });
  }
  return { logo: logoId, banners: bannersWithIds };
};
