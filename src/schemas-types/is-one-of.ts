// A refine check that the value is one of `values`. The explicit `: boolean` return stops TypeScript
// inferring a type predicate, which would narrow the schema's output type and reject a form's empty
// initial value.
export const isOneOf =
	(...values: string[]) =>
	(value: string): boolean =>
		values.includes(value);
