import { Avatar, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { type ReactNode, useEffect, useRef } from "react";
import { levelUpProgress } from "@/components/engage/engage-progress.ts";
import { useFetchLevelupInfo } from "@/components/levelup/queries/fetch-levelup.ts";
import { HUB_TABS, hubTabFor } from "@/components/profile/hub/hub-tabs.ts";
import { playerName } from "@/components/profile/player-name.ts";
import { useCurrentPathname } from "@/hooks/use-current-pathname.ts";
import { SIDEBAR_REFETCH_MS } from "@/layout/shell/engage-widgets.tsx";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";
import { useGetPlayerInfo } from "@/server/IPS/user/get-player-info.ts";
import classes from "./profile-hub.module.css";

const AVATAR_SIZE = 120;

// The cover banner, the player's initials, Level Up level (unless the Brand hides Level
// Up) and name.
const HubHeader = () => {
	const { data: playerInfo } = useGetPlayerInfo();
	const { engageFeatures } = useBrandContent();
	// Only the level is shown, so it refreshes as rarely as the sidebar widget.
	const { data: levelUpData } = useFetchLevelupInfo({
		refetchInterval: SIDEBAR_REFETCH_MS,
		isEnabled: engageFeatures.levelUp,
	});
	const level = engageFeatures.levelUp
		? levelUpProgress(levelUpData?.data)?.level
		: undefined;
	const name = playerName(playerInfo);

	return (
		<header className={classes.header}>
			<div className={classes.banner} />
			<div className={classes.identity}>
				<Avatar
					name={name}
					size={AVATAR_SIZE}
					radius="50%"
					color="neon"
					variant="filled"
					autoContrast
					className={classes.avatar}
					// The name is written out below it.
					aria-hidden
				/>
				{level === undefined ? null : (
					<Text component="span" className={classes.level}>
						Level {level}
					</Text>
				)}
				<Title order={1} className={classes.name}>
					{name}
				</Title>
			</div>
		</header>
	);
};

const HubTabs = () => {
	const active = hubTabFor(useCurrentPathname());
	const navRef = useRef<HTMLElement>(null);

	// On a phone the tab strip scrolls sideways; keep the selected tab in view.
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-run when the selected tab changes
	useEffect(() => {
		navRef.current
			?.querySelector('[aria-current="page"]')
			?.scrollIntoView({ block: "nearest", inline: "center" });
	}, [active]);

	return (
		<nav aria-label="Profile" className={classes.tabs} ref={navRef}>
			{HUB_TABS.map((tab) => (
				<Link
					key={tab.key}
					to={tab.to}
					className={classes.tab}
					aria-current={tab.key === active ? "page" : undefined}
				>
					{tab.label}
				</Link>
			))}
		</nav>
	);
};

// The profile hub: header and tabs above the selected tab's page.
export function ProfileHub({ children }: { children: ReactNode }) {
	return (
		<div className={classes.hub}>
			<HubHeader />
			<HubTabs />
			{children}
		</div>
	);
}
