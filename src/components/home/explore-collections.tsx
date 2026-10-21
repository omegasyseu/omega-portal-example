import { Button, Text, Title, VisuallyHidden } from "@mantine/core";
import { useState } from "react";
import GameCard from "@/components/games/game-card";
import {
	EXPLORE_PAGE_SIZE,
	exploreGames,
	gameKey,
} from "@/components/games/lobby-model.ts";
import { NoGames } from "@/components/games/no-games.tsx";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";
import classes from "./home.module.css";

const ExploreTitle = () => (
	<Title order={2} id="explore-title" className={classes.sectionTitle}>
		Explore collections
	</Title>
);

// "Explore collections": a pill per Collection the Brand shows, over a grid of the picked
// one's games that grows a page at a time. A Brand with no Collections shows its whole
// lobby, and a lobby with no games gets a message instead.
export function ExploreCollections() {
	const [collection, setCollection] = useState<string>();
	const [limit, setLimit] = useState(EXPLORE_PAGE_SIZE);
	const { lobby: games, collections } = useBrandContent();
	const explore = exploreGames({ games, collections, collection, limit });

	const pick = (slug: string) => {
		setCollection(slug);
		setLimit(EXPLORE_PAGE_SIZE);
	};

	if (games.length === 0) {
		return (
			<section className={classes.explore} aria-labelledby="explore-title">
				<ExploreTitle />
				<NoGames />
			</section>
		);
	}

	return (
		<section className={classes.explore} aria-labelledby="explore-title">
			<div>
				<ExploreTitle />
				<Text className={classes.sectionLead}>
					{explore.count} {explore.count === 1 ? "game" : "games"} to choose
					from
				</Text>
			</div>
			{explore.tabs.length > 0 ? (
				<fieldset className={classes.pills}>
					<VisuallyHidden component="legend">Game collections</VisuallyHidden>
					{explore.tabs.map(({ key, label }) => {
						const isPicked = key === explore.collection;
						return (
							<Button
								key={key}
								variant={isPicked ? "filled" : "default"}
								aria-pressed={isPicked}
								onClick={() => pick(key)}
								className={classes.pill}
							>
								{label}
							</Button>
						);
					})}
				</fieldset>
			) : null}
			<ul className={classes.exploreGrid}>
				{explore.games.map((game) => (
					<li key={gameKey(game)}>
						<GameCard game={game} />
					</li>
				))}
			</ul>
			{explore.moreCount > 0 ? (
				<Button
					variant="default"
					onClick={() => setLimit((shown) => shown + EXPLORE_PAGE_SIZE)}
					className={classes.showMore}
				>
					Show more ({explore.moreCount})
				</Button>
			) : null}
		</section>
	);
}
