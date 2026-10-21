import { Button, Text } from "@mantine/core";
import classes from "./promotions.module.css";

// A Bonus call failed: say so, rather than showing an account with no Bonuses.
export const LoadError = ({ onRetry }: { onRetry: () => void }) => (
	<div className={classes.empty} role="alert">
		<Text className={classes.lead}>
			We couldn't load your Bonuses. Check your connection and try again.
		</Text>
		<Button variant="default" onClick={onRetry}>
			Try again
		</Button>
	</div>
);
