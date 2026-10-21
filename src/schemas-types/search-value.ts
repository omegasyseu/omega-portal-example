import { z } from "zod";

// A text search param. The router's default parser reads numeric values
// (?referralCode=12345) as numbers, so both are accepted; any other value
// reads as missing rather than failing the route. Numbers aren't turned into
// text here: the router would then rewrite the URL to ?referralCode="12345".
export const searchValue = z
	.union([z.string(), z.number()])
	.optional()
	.catch(undefined);
