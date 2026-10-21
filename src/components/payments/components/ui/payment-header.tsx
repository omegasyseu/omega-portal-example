import { Text, Title } from "@mantine/core";
import type { ReactNode } from "react";
import classes from "./payments.module.css";

// A payment page's title, with a line of guidance or a way back under it.
export function PaymentHeader({
	title,
	children,
}: {
	title: ReactNode;
	children: ReactNode;
}) {
	return (
		<div>
			<Title order={1} className={classes.title}>
				{title}
			</Title>
			<Text component="div" className={classes.lead}>
				{children}
			</Text>
		</div>
	);
}
