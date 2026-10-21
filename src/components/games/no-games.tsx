import { Text } from "@mantine/core";
import classes from "./no-games.module.css";

// Stands in for the games when the Selected Brand's lobby lists none.
export const NoGames = () => (
	<div className={classes.noGames}>
		<Text className={classes.title}>No games to play yet</Text>
		<Text className={classes.lead}>
			New games are on their way. Check back soon.
		</Text>
	</div>
);
