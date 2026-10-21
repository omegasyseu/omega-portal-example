import { Avatar, Box, Button, Group, Indicator } from "@mantine/core";
import { Link, useParams, useSearch } from "@tanstack/react-router";
import { openAuthLink } from "@/components/auth/hooks/use-auth-dialog.ts";
import { BrandSwitcher } from "@/components/brand/brand-switcher.tsx";
import { GameSearch } from "@/components/games/game-search.tsx";
import { searchText } from "@/components/games/game-view/sportsbook.ts";
import { useLinkedGame } from "@/components/games/game-view/use-linked-game.ts";
import { useNeedsKycAction } from "@/components/kyc/use-needs-kyc-action.ts";
import { NotificationManager } from "@/components/notifications/NotificationManager";
import { playerName } from "@/components/profile/player-name.ts";
import { QuestPurchaseModalManager } from "@/components/quest/QuestPurchaseModalManager";
import { HEADER_CONTROL_SIZE } from "@/constants/ui-sizes.ts";
import { useCurrentPathname } from "@/hooks/use-current-pathname.ts";
import { BalanceMenu } from "@/layout/shell/balance-menu.tsx";
import { isGamePath } from "@/layout/shell/navigation-model.ts";
import { ShellLogo } from "@/layout/shell/shell-logo.tsx";
import { useShellNavigation } from "@/layout/shell/use-shell-navigation.ts";
import { useGetPlayerInfo } from "@/server/IPS/user/get-player-info.ts";
import classes from "./shell.module.css";

const SEARCH_WIDTH = 244;
const BRAND_SWITCHER_WIDTH = 200;

const KYC_DOT_SIZE = 10;
const KYC_DOT_OFFSET = 3;

// A gold dot (the Action Needed colour) while the brand is asking for KYC.
const PlayerAvatar = () => {
	const { data: playerInfo } = useGetPlayerInfo();
	const name = playerName(playerInfo);
	const needsKycAction = useNeedsKycAction();

	return (
		<Indicator
			inline
			color="gold"
			size={KYC_DOT_SIZE}
			offset={KYC_DOT_OFFSET}
			withBorder
			disabled={!needsKycAction}
		>
			<Avatar
				component={Link}
				to="/profile"
				name={name}
				size={HEADER_CONTROL_SIZE}
				radius="md"
				aria-label={
					needsKycAction ? "My profile, KYC action needed" : "My profile"
				}
				classNames={{ root: classes.avatar }}
			/>
		</Indicator>
	);
};

const PlayerActions = () => {
	const pathname = useCurrentPathname();
	const productCode = useSearch({
		strict: false,
		select: (search) => search.productCode,
	});
	const gameId = useParams({ strict: false, select: (params) => params.game });
	const isGameOpen = isGamePath(pathname);
	const { isSportsbook } = useLinkedGame(
		isGameOpen ? searchText(productCode) : undefined,
		gameId,
	);
	const isSlotOpen = isGameOpen && !isSportsbook;

	return (
		<Group gap="sm" wrap="nowrap">
			<NotificationManager />
			<QuestPurchaseModalManager />
			{/* A game plays from its own wallet, which this balance doesn't follow in real
			    time, so it's left out while a game is open (and so is the currency switch,
			    which would reload the game under another session); the game page has its
			    own quick deposit. Unmounting it means the balance is fetched afresh when the
			    player leaves the game. A sportsbook has no quick deposit, so it keeps the
			    balance and its Deposit button; switching currency there only reloads the
			    bet slip. */}
			{isSlotOpen ? null : <BalanceMenu />}
			<PlayerAvatar />
		</Group>
	);
};

// Login and Register open their dialog over the page the visitor is on.
const VisitorActions = () => (
	<Group gap="sm" wrap="nowrap">
		<Button
			renderRoot={(props) => <Link {...props} {...openAuthLink("login")} />}
			variant="default"
		>
			Login
		</Button>
		<Button
			renderRoot={(props) => <Link {...props} {...openAuthLink("signup")} />}
			color="cta"
		>
			Register
		</Button>
	</Group>
);

export function ShellHeader() {
	const { isLoggedIn } = useShellNavigation();

	return (
		<Group className={classes.header} justify="space-between" wrap="nowrap">
			<Group gap="sm" wrap="nowrap" className={classes.headerStart}>
				<Link to="/" className={classes.headerLogo} aria-label="Home">
					<ShellLogo placement="header" />
				</Link>
				<Box visibleFrom="sm" w={SEARCH_WIDTH}>
					<GameSearch />
				</Box>
			</Group>
			<Group gap="sm" wrap="nowrap">
				{/* Below md the header has no room beside the search and the account
				    controls, so the sidebar (or the phone menu) carries it. */}
				<BrandSwitcher visibleFrom="md" w={BRAND_SWITCHER_WIDTH} />
				{isLoggedIn ? <PlayerActions /> : <VisitorActions />}
			</Group>
		</Group>
	);
}
