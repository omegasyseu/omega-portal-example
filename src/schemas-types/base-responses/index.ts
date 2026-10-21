import { z } from "zod";

export const BASE_RESPONSE_SCHEMA = z.object({
	// MOST API FROM IPS API ALWAYS HAS A STATUS AND A MESSAGE
	status: z.string(),
	message: z.string(),
	// ALL OF THESE ARE OPTIONAL, COULD EXIST OR NOT, THIS SATISFIES AND MAKE TS HAPPY
	errors: z
		.array(z.object({ field: z.string(), error: z.string() }))
		.optional(),

	additionalInfo: z
		.array(z.object({ key: z.string(), value: z.string() }))
		.optional(),
	advices: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
});

export type BaseResponse = z.infer<typeof BASE_RESPONSE_SCHEMA>;

export const BASE_AMS_RESPONSE_SCHEMA = z.object({
	code: z.string(),
	message: z.string(),
	timestamp: z.string(),
});
