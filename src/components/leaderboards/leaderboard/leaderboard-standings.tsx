import { NumberFormatter, Text, VisuallyHidden } from "@mantine/core";
import { IconTrophy } from "@tabler/icons-react";
import {
	type Standing,
	splitStandings,
} from "@/components/leaderboards/leaderboard/standings.ts";
import { getCurrencySymbol } from "@/hooks/use-format/fomatCurrencySymbol";
import classes from "./leaderboard-table.module.css";

type Currency = { isoCode?: string; decimal?: number };

const PLACE_NAMES = ["First", "Second", "Third"];

const Money = ({ value, currency }: { value: number; currency: Currency }) => (
	<NumberFormatter
		prefix={getCurrencySymbol(currency.isoCode)}
		thousandSeparator=","
		value={value}
		decimalScale={currency.decimal}
	/>
);

const Podium = ({
	podium,
	currency,
}: {
	podium: Standing[];
	currency: Currency;
}) => (
	<ol className={classes.podium} aria-label="Top three">
		{podium.map((standing, place) => (
			<li
				key={`${standing.rank}-${standing.username}`}
				className={classes.podiumPlace}
				data-place={place + 1}
			>
				<span className={classes.medal}>
					<IconTrophy size={20} aria-hidden />
					<span className={classes.medalRank}>
						<VisuallyHidden>{PLACE_NAMES[place]} place, rank </VisuallyHidden>
						{standing.rank}
					</span>
				</span>
				<Text className={classes.podiumName} truncate>
					{standing.username}
				</Text>
				<Text className={classes.podiumPrize}>
					<Money value={standing.prize} currency={currency} />
				</Text>
				<Text className={classes.podiumWagered}>
					Wagered{" "}
					<Money value={standing.wageringInPeriod} currency={currency} />
				</Text>
			</li>
		))}
	</ol>
);

// The period's standings: the top three on a podium, everyone else in a list.
export function LeaderboardStandings({
	rankings,
	currency,
}: {
	rankings: Standing[];
	currency: Currency;
}) {
	const { podium, rest } = splitStandings(rankings);

	if (podium.length === 0) {
		return (
			<Text className={classes.empty}>
				No one has ranked in this period yet.
			</Text>
		);
	}

	return (
		<>
			<Podium podium={podium} currency={currency} />
			{rest.length > 0 ? (
				<div className={classes.list}>
					<div className={classes.listHeader} aria-hidden>
						<span>Rank</span>
						<span>Player</span>
						<span className={classes.amount}>Wagered</span>
						<span className={classes.amount}>Prize</span>
					</div>
					<ol className={classes.rows} aria-label="Other ranks">
						{rest.map((standing) => (
							<li
								key={`${standing.rank}-${standing.username}`}
								className={classes.row}
							>
								<span className={classes.rank}>{standing.rank}</span>
								<span className={classes.name}>{standing.username}</span>
								<span className={classes.amount}>
									<VisuallyHidden>Wagered </VisuallyHidden>
									<Money
										value={standing.wageringInPeriod}
										currency={currency}
									/>
								</span>
								<span className={classes.amount}>
									<VisuallyHidden>Prize </VisuallyHidden>
									<Money value={standing.prize} currency={currency} />
								</span>
							</li>
						))}
					</ol>
				</div>
			) : null}
		</>
	);
}
