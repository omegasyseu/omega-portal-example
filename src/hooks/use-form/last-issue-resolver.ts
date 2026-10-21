import type { FormErrors } from "@mantine/form";
import type { z } from "zod";

// Shows a field's last issue when it has several, as the zodResolver this
// replaced did. Mantine's own schemaResolver shows the first one instead.
export const lastIssueResolver =
	(schema: z.ZodType) =>
	(values: unknown): FormErrors => {
		const result = schema.safeParse(values);
		if (result.success) return {};
		return Object.fromEntries(
			result.error.issues.map((issue) => [
				issue.path.map(String).join("."),
				issue.message,
			]),
		);
	};
