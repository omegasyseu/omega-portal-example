import { Button, Image, Skeleton, Text, Title, Tooltip } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import classes from "@/components/challenges/badges.module.css";
import engage from "@/components/engage/engage.module.css";
import { useEngageDialogLink } from "@/components/engage-dialog/use-engage-dialog.ts";
import { useGetBadges } from "@/server/IPS/challenges/get-badges.ts";
import { formatIpsDate } from "@/utils/date.ts";

const SKELETON_TILES = 6;
const SKELETON_TILE_HEIGHT = 208;

const BadgeGridSkeleton = () => (
	<ul className={classes.grid} aria-busy="true" aria-label="Loading badges">
		{Array.from({ length: SKELETON_TILES }, (_, index) => (
			// biome-ignore lint/suspicious/noArrayIndexKey: placeholders have no id
			<li key={index}>
				<Skeleton h={SKELETON_TILE_HEIGHT} radius="lg" />
			</li>
		))}
	</ul>
);

const BadgesPage = () => {
	// Challenges opens as a dialog over this page.
	const challengesLink = useEngageDialogLink("challenges");
	const { data, isLoading } = useGetBadges();
	const badges = data?.data?.badges ?? [];

	const renderBadges = () => {
		if (isLoading) {
			return <BadgeGridSkeleton />;
		}
		if (!badges.length) {
			return (
				<Text className={engage.empty}>
					No badges yet. Complete a challenge to earn one.
				</Text>
			);
		}
		return (
			<ul className={classes.grid}>
				{badges.map((b) => {
					const date = formatIpsDate(b.badgeDate, "D MMM YYYY");
					return (
						<li key={b.badgeUUID} className={classes.tile}>
							<Image
								className={classes.badge}
								src="/icons/badge-default.png"
								alt=""
							/>
							<Tooltip label={b.challenge?.title}>
								<Text className={classes.badgeTitle}>{b.challenge?.title}</Text>
							</Tooltip>
							{date && (
								<Text
									component="time"
									dateTime={formatIpsDate(b.badgeDate, "YYYY-MM-DD")}
									className={classes.badgeDate}
								>
									{date}
								</Text>
							)}
						</li>
					);
				})}
			</ul>
		);
	};

	return (
		<div className={engage.page}>
			<header className={engage.header}>
				<div>
					<Title order={1} className={engage.title}>
						Badges
					</Title>
					<Text className={engage.lead}>
						Badges you've earned from challenges.
					</Text>
				</div>
				<Button
					variant="default"
					renderRoot={(props) => <Link {...props} {...challengesLink} />}
				>
					Challenges
				</Button>
			</header>
			{renderBadges()}
		</div>
	);
};
export const Route = createFileRoute("/_challenges/badges/")({
	component: BadgesPage,
});
