import { queryOptions, skipToken } from "@tanstack/react-query";
import { z } from "zod";
import { getStrapiUrl } from "@/server/config.ts";

// Edits published in Strapi reach players within about five minutes.
const STRAPI_STALE_TIME = 5 * 60 * 1000;

// The first entry a Strapi collection query returns, or undefined when none matches.
// Throws when Strapi can't be reached or answers with something else.
export const fetchStrapiOne = async <T extends z.ZodType>(
	path: string,
	schema: T,
	signal?: AbortSignal,
): Promise<z.infer<T> | undefined> => {
	const response = await fetch(`${getStrapiUrl()}${path}`, { signal });
	if (!response.ok) {
		throw new Error(`Strapi answered ${response.status} for ${path}`);
	}
	const { data } = z
		.object({ data: z.array(schema) })
		.parse(await response.json());
	return data[0];
};

// A Strapi query by an id that may not be known yet; skipped while it is undefined.
export const strapiQueryOptions = <T>(
	keyPrefix: string,
	id: string | undefined,
	load: (id: string, signal: AbortSignal) => Promise<T>,
) =>
	queryOptions({
		queryKey: [keyPrefix, id],
		queryFn: id === undefined ? skipToken : ({ signal }) => load(id, signal),
		staleTime: STRAPI_STALE_TIME,
	});
