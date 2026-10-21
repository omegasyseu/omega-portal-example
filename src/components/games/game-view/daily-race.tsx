import { Button, Skeleton, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { formatNumByCurrency } from "@/hooks/use-format/fomatCurrencySymbol";
import { useShownBrandId } from "@/providers/brand-content/brand-content-provider.tsx";
import { getRankingByLeaderBoardsOptions } from "@/server/IPS/leadeboards/get-specific-leaderboard.ts";
import classes from "./game-view.module.css";

const TOP_SIZE = "10";
// About the height of a loaded table, so the page below doesn't jump when it arrives.
const LOADING_HEIGHT = 360;
// The top three places are marked, as on Omega Wins.
const MARKED_PLACES = 3;

// Today's running leaderboard: its name names the tab, and with no daily leaderboard
// running (or a failed request) there is no race to show. Not asked for while the
// race is switched off.
export const useDailyRace = (isEnabled = true) => {
	const brandId = useShownBrandId();
	const query = useQuery({
		...getRankingByLeaderBoardsOptions({
			period: "DAILY",
			size: TOP_SIZE,
			brandId,
		}),
		enabled: isEnabled,
	});
	const leaderboard = query.isError
		? undefined
		: query.data?.currentLeaderboard;
	return {
		...query,
		name: leaderboard?.leaderboardName,
		hasRace: query.isPending || leaderboard !== undefined,
	};
};

// The Daily Race as Omega Wins shows it below the game: each player's place, name,
// amount wagered and prize.
export function DailyRace() {
	const { data, isPending, hasRace, name } = useDailyRace();

	if (isPending) {
		return <Skeleton height={LOADING_HEIGHT} radius="lg" />;
	}
	if (!hasRace) {
		return null;
	}

	const rankings = data?.rankings.data?.rankings ?? [];
	const currency = data?.currentLeaderboard?.currency.isoCode ?? "";
	const money = (amount: number) => formatNumByCurrency(amount, currency);

	return (
		<div className={classes.race}>
			{rankings.length > 0 ? (
				<table className={classes.raceTable} aria-label={name}>
					<thead>
						<tr>
							<th scope="col">Place</th>
							<th scope="col">User</th>
							<th scope="col">Wagered</th>
							<th scope="col">Prize</th>
						</tr>
					</thead>
					<tbody>
						{rankings.map(({ rank, username, wageringInPeriod, prize }) => (
							<tr key={`${rank}-${username}`}>
								<td>
									<span
										className={classes.racePlace}
										data-marked={rank <= MARKED_PLACES || undefined}
									>
										{rank}
									</span>
								</td>
								<td className={classes.raceName}>{username}</td>
								<td className={classes.raceAmount}>
									{money(wageringInPeriod)}
								</td>
								<td className={classes.raceAmount}>{money(prize)}</td>
							</tr>
						))}
					</tbody>
				</table>
			) : (
				<Text className={classes.cardText}>
					No rankings yet today. Play to get on the board.
				</Text>
			)}
			<Button
				component={Link}
				to="/leaderboard"
				variant="default"
				size="xs"
				className={classes.raceMore}
			>
				View leaderboard
			</Button>
		</div>
	);
}
