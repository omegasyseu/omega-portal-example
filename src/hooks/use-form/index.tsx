import { type UseFormInput, useForm } from "@mantine/form";
import type { z } from "zod";
import { lastIssueResolver } from "./last-issue-resolver";

export function useMantineForm<
	TSchema extends z.ZodType<Record<string, unknown>>,
>(
	props: Omit<UseFormInput<z.infer<TSchema>>, "validate"> & {
		validate: TSchema;
	},
) {
	const { validate, ...restProps } = props;

	return useForm<z.infer<TSchema>>({
		...restProps,
		validate: lastIssueResolver(validate),
	});
}
