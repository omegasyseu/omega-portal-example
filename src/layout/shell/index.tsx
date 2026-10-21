import { AppShell, Flex, useMantineTheme } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { type ReactNode, useEffect } from "react";
import { CookieNotice } from "@/components/cookie-notice/cookie-notice.tsx";
import { useCurrentPathname } from "@/hooks/use-current-pathname.ts";
import { BottomNav } from "@/layout/shell/bottom-nav.tsx";
import { MenuDrawer } from "@/layout/shell/menu-drawer.tsx";
import { SHELL_CHROME } from "@/layout/shell/shell-chrome.ts";
import { ShellFooter } from "@/layout/shell/shell-footer.tsx";
import { ShellHeader } from "@/layout/shell/shell-header.tsx";
import {
	BOTTOM_NAV_HEIGHT,
	HEADER_HEIGHT,
	SIDEBAR_WIDTH,
} from "@/layout/shell/shell-sizes.ts";
import { Sidebar } from "@/layout/shell/sidebar.tsx";
import classes from "./shell.module.css";

// The Omega Wins frame around every page. Desktop has the sidebar; phones get a bottom nav
// whose Menu slot opens the same sidebar as a drawer from the right.
export function OmegaAppShell({ children }: { children: ReactNode }) {
	const [isMenuOpen, { open: openMenu, close: closeMenu }] =
		useDisclosure(false);
	const theme = useMantineTheme();
	// One sidebar is mounted at a time, so its winner ticker opens a single socket.
	const isDesktop = useMediaQuery(
		`(min-width: ${theme.breakpoints.sm})`,
		false,
		{ getInitialValueInEffect: false },
	);
	const pathname = useCurrentPathname();

	// Back/forward, redirects and growing to desktop width all close the phone menu.
	// biome-ignore lint/correctness/useExhaustiveDependencies: these values are the triggers, not inputs
	useEffect(() => {
		closeMenu();
	}, [pathname, isDesktop, closeMenu]);

	return (
		<AppShell
			layout="alt"
			header={{ height: HEADER_HEIGHT }}
			navbar={{
				width: SIDEBAR_WIDTH,
				breakpoint: "sm",
				collapsed: { mobile: true },
			}}
			// Reserves room below the content on phones so the bottom nav never covers it.
			footer={{ height: { base: BOTTOM_NAV_HEIGHT, sm: 0 } }}
			classNames={{
				header: classes.appShellHeader,
				navbar: classes.appShellNavbar,
				main: classes.appShellMain,
				footer: classes.appShellFooter,
			}}
		>
			<a href="#main-content" className={classes.skipLink}>
				Skip to content
			</a>
			<AppShell.Header {...SHELL_CHROME}>
				<ShellHeader />
			</AppShell.Header>
			<AppShell.Navbar {...SHELL_CHROME}>
				{isDesktop ? <Sidebar onNavigate={closeMenu} /> : null}
			</AppShell.Navbar>
			<AppShell.Main id="main-content">
				<Flex
					direction="column"
					align="center"
					w="100%"
					className={classes.content}
				>
					{children}
				</Flex>
				<ShellFooter />
			</AppShell.Main>
			<AppShell.Footer hiddenFrom="sm" {...SHELL_CHROME}>
				<BottomNav isMenuOpen={isMenuOpen} onOpenMenu={openMenu} />
			</AppShell.Footer>
			<MenuDrawer isOpen={isMenuOpen && !isDesktop} onClose={closeMenu} />
			<CookieNotice />
		</AppShell>
	);
}
