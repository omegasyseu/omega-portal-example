import {
	Badge,
	Box,
	Burger,
	Divider,
	NavLink,
	ScrollArea,
	Text,
	VisuallyHidden,
} from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { Link, useLocation, useSearch } from "@tanstack/react-router";
import { useGetActiveBonuses } from "@/components/bonuses/queries/get-active-bonuses.ts";
import { BrandSwitcher } from "@/components/brand/brand-switcher.tsx";
import { useOpenEngageDialog } from "@/components/engage-dialog/use-engage-dialog.ts";
import { GameSearch } from "@/components/games/game-search.tsx";
import { pickCollection } from "@/components/games/lobby-model.ts";
import { useCurrentPathname } from "@/hooks/use-current-pathname.ts";
import { useLogOut } from "@/hooks/use-log-out";
import { EngageWidgets } from "@/layout/shell/engage-widgets.tsx";
import { gamesLinkIcon, gamesLinkRoot } from "@/layout/shell/games-link.tsx";
import { NAV_ICONS, renderNavIcon } from "@/layout/shell/nav-icons.tsx";
import { navLinkProps } from "@/layout/shell/nav-link-props.ts";
import {
	isLinkActive,
	type NavLink as NavLinkItem,
} from "@/layout/shell/navigation-model.ts";
import { ShellLogo } from "@/layout/shell/shell-logo.tsx";
import Ticker from "@/layout/shell/ticker";
import { useShellNavigation } from "@/layout/shell/use-shell-navigation.ts";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";
import classes from "./shell.module.css";

type Props = {
	// Closes the sidebar when it is open as the mobile menu.
	onNavigate: () => void;
};

const NAV_LINK_CLASS_NAMES = {
	root: classes.navLink,
	section: classes.navIcon,
};

const SidebarLogo = ({ onNavigate }: Props) => (
	<Box className={classes.sidebarLogo}>
		<Link to="/" onClick={onNavigate} aria-label="Home">
			<ShellLogo placement="sidebar" />
		</Link>
		{/* Inside the phone menu drawer, this closes it. */}
		<Burger
			opened
			onClick={onNavigate}
			hiddenFrom="sm"
			size="sm"
			aria-label="Close menu"
		/>
	</Box>
);

// How many Bonuses the player holds, for the Promotions badge; none when logged out.
const useActiveBonusCount = () => {
	const { data } = useGetActiveBonuses();
	return (data?.bonuses ?? []).filter(Boolean).length;
};

const CountBadge = ({ count }: { count: number }) =>
	count > 0 ? (
		<Badge color="neon" c="dark.9" size="sm" circle>
			{count}
			<VisuallyHidden> active Bonuses</VisuallyHidden>
		</Badge>
	) : null;

const MainNavigation = ({ onNavigate }: Props) => {
	const { socialCenter, payments, games } = useShellNavigation();
	const activeBonusCount = useActiveBonusCount();
	const pathname = useCurrentPathname();
	const href = useLocation({ select: (location) => location.href });
	const openDialog = useOpenEngageDialog();
	const { collections } = useBrandContent();
	const { collection } = useSearch({ strict: false });
	// The Collection the Games page shows: All for one the Brand doesn't show.
	const shownCollection = pickCollection(collections, collection)?.slug;

	const renderLink = (item: NavLinkItem) => (
		<NavLink
			key={item.key}
			renderRoot={(props) => <Link {...props} {...navLinkProps(item, href)} />}
			label={item.label}
			leftSection={renderNavIcon(NAV_ICONS[item.icon])}
			rightSection={
				item.key === "promotions" ? (
					<CountBadge count={activeBonusCount} />
				) : null
			}
			active={isLinkActive(item, pathname, openDialog)}
			onClick={onNavigate}
			classNames={NAV_LINK_CLASS_NAMES}
		/>
	);

	return (
		<nav aria-label="Main">
			<Text component="h2" className={classes.sectionLabel}>
				Social Center
			</Text>
			{socialCenter.map(renderLink)}
			{/* Set apart from the Social Center, as on Omega Wins. */}
			{payments.length > 0 ? (
				<div className={classes.navGroup}>{payments.map(renderLink)}</div>
			) : null}
			<Divider className={classes.navDivider} />
			<Text component="h2" className={classes.sectionLabel}>
				Games
			</Text>
			{games.map((item) => (
				<NavLink
					key={item.key}
					renderRoot={gamesLinkRoot(item)}
					label={item.label}
					leftSection={renderNavIcon(gamesLinkIcon(item))}
					active={pathname === "/games" && shownCollection === item.collection}
					onClick={onNavigate}
					classNames={NAV_LINK_CLASS_NAMES}
				/>
			))}
		</nav>
	);
};

const PlayerSection = ({ onNavigate }: Props) => {
	const logOut = useLogOut();

	return (
		<>
			<Divider className={classes.navDivider} />
			<NavLink
				component="button"
				type="button"
				label="Logout"
				leftSection={renderNavIcon(IconLogout)}
				onClick={() => {
					onNavigate();
					void logOut();
				}}
				classNames={NAV_LINK_CLASS_NAMES}
			/>
			{/* Last, so the space it keeps for a win message (empty most of the time)
			    never strands Logout below a gap. */}
			<Box className={classes.ticker}>
				<Ticker />
			</Box>
		</>
	);
};

export function Sidebar({ onNavigate }: Props) {
	const { isLoggedIn } = useShellNavigation();

	return (
		<>
			<SidebarLogo onNavigate={onNavigate} />
			<ScrollArea className={classes.sidebarScroll} type="scroll">
				{/* The header search is hidden on phones, so the menu drawer carries it. */}
				<Box hiddenFrom="sm" className={classes.drawerSearch}>
					<GameSearch />
				</Box>
				{/* The header carries the Brand switcher from md up. */}
				<BrandSwitcher
					hiddenFrom="md"
					className={classes.sidebarBrandSwitcher}
				/>
				{isLoggedIn ? <EngageWidgets onNavigate={onNavigate} /> : null}
				<MainNavigation onNavigate={onNavigate} />
				{isLoggedIn ? <PlayerSection onNavigate={onNavigate} /> : null}
			</ScrollArea>
		</>
	);
}
