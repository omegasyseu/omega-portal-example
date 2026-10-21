import type { Core } from '@strapi/strapi';

// Brands and games only hold images: logos, banners and tiles.
const allowedTypes = ['image/*'];

// SVG can carry scripts, so it's refused although it's an image.
const deniedTypes = ['image/svg+xml'];

const config = (): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        httpOnly: true,
      },
    },
  },
  upload: {
    config: {
      security: {
        allowedTypes,
        deniedTypes,
      },
    },
  },
});

export default config;
