import { Stack, Title } from "@mantine/core";
import type { ReactNode } from "react";

// A hub tab's own content. The hub above already shows the player and the tabs, so the
// tab only needs a compact heading.
export function HubSection({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<Stack gap="md" w="100%">
			<Title order={2} fz="xl" fw={700} c="dark.0">
				{title}
			</Title>
			{children}
		</Stack>
	);
}
