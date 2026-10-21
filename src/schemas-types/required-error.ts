// Zod 4 dropped `required_error`. This keeps its behaviour: the message for a
// missing value, and Zod's default message for a value of the wrong type.
export const requiredError =
	(message: string) =>
	(issue: { input: unknown }): string | undefined =>
		issue.input === undefined ? message : undefined;
