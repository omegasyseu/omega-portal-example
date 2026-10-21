import { Anchor, Box, SimpleGrid, Stack, Text } from "@mantine/core";
import { Link, useLocation } from "@tanstack/react-router";
import { useBrandName } from "@/components/brand/use-brand-name.ts";
import { gamesLinkRoot } from "@/layout/shell/games-link.tsx";
import { navLinkProps } from "@/layout/shell/nav-link-props.ts";
import type { FooterLink } from "@/layout/shell/navigation-model.ts";
import { ShellLogo } from "@/layout/shell/shell-logo.tsx";
import { useShellNavigation } from "@/layout/shell/use-shell-navigation.ts";
import classes from "./shell.module.css";

// Shown in the footer, on every page.
const DEMO_DISCLAIMER =
	"DEMO VERSION: This website is for demonstration and testing purposes only. No real money wagering is permitted, and no actual payouts will be issued.";

const FooterItem = ({ link }: { link: FooterLink }) => {
	const href = useLocation({ select: (location) => location.href });
	if (link.kind === "legal") {
		return (
			<Anchor
				renderRoot={(props) => (
					<Link {...props} to="/legal/$page" params={{ page: link.key }} />
				)}
				className={classes.footerLink}
			>
				{link.label}
			</Anchor>
		);
	}
	if (link.kind === "games") {
		return (
			<Anchor renderRoot={gamesLinkRoot(link)} className={classes.footerLink}>
				{link.label}
			</Anchor>
		);
	}
	return (
		<Anchor
			renderRoot={(props) => <Link {...props} {...navLinkProps(link, href)} />}
			className={classes.footerLink}
		>
			{link.label}
		</Anchor>
	);
};

export function ShellFooter() {
	const { footer } = useShellNavigation();
	const brandName = useBrandName();

	return (
		<Box component="footer" className={classes.footer}>
			<SimpleGrid
				cols={{ base: 2, md: 4 }}
				spacing="xl"
				className={classes.footerGrid}
			>
				<Box>
					<ShellLogo placement="footer" isNamed />
				</Box>
				{footer.map((column) => (
					<Stack key={column.title} gap="sm">
						<Text component="h2" className={classes.footerTitle}>
							{column.title}
						</Text>
						{column.links.map((link) => (
							<FooterItem key={link.key} link={link} />
						))}
					</Stack>
				))}
			</SimpleGrid>
			<Text className={classes.footerDisclaimer}>{DEMO_DISCLAIMER}</Text>
			<Text className={classes.footerDisclaimer}>
				© {new Date().getFullYear()}
				{brandName ? ` ${brandName}` : ""}. All rights reserved.
			</Text>
		</Box>
	);
}
