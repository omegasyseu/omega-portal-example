import { Button, Container, Group, Text, Title } from "@mantine/core";
import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import classes from "./not-found.module.css";

// What any page shows when it fails: a request it can't do without was refused, it
// crashed while drawing, or its code didn't load. Players see a plain message, never
// IPS's own text or a stack trace; the router logs the error (defaultOnCatch, main.tsx).
export function PageLoadError() {
	const isHome = useLocation({
		select: (location) => location.pathname === "/",
	});

	return (
		<LoadErrorMessage>
			{/* On home itself it would only show this again. The button is the link, so
			    there's no button nested inside an anchor. */}
			{isHome ? null : (
				<Button component={Link} to="/" size="md" variant="default">
					Back to home
				</Button>
			)}
		</LoadErrorMessage>
	);
}

// The message itself, which needs no router: the whole portal shows it when its Brand
// content can't load (brand-content-provider.tsx). Children are further actions.
export function LoadErrorMessage({ children }: { children?: ReactNode }) {
	return (
		<Container className={classes.root}>
			<Title order={1} className={classes.title}>
				This page couldn't load
			</Title>
			<Text size="md" className={classes.description} role="alert">
				Try again, or contact Customer Support if this keeps happening.
			</Text>
			<Group justify="center">
				{/* A full reload: the browser keeps a page's code that failed to load (as after
				    a new release) failed until the page is reloaded, and a reload also asks
				    again for anything else that failed. */}
				<Button size="md" onClick={() => window.location.reload()}>
					Try again
				</Button>
				{children}
			</Group>
		</Container>
	);
}
