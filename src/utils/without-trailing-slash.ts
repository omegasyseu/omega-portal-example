// A configured URL without surrounding spaces or a trailing slash, so paths can be
// appended to it. The portal's settings and `pnpm dev:all` (scripts/) both use it.
export const withoutTrailingSlash = (url: string): string =>
	url.trim().replace(/\/+$/, "");
