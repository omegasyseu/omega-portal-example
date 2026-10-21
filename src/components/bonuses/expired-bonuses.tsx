import { Badge, Skeleton, Text, Title } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { LoadError } from "@/components/bonuses/load-error.tsx";
import type {
	BonusCard,
	HistoryWindow,
} from "@/components/bonuses/promotions-model.ts";
import { formatNumByCurrency } from "@/hooks/use-format/fomatCurrencySymbol";
import classes from "./promotions.module.css";

const LOADING_HEIGHT = 120;

type Props = {
	bonuses: BonusCard[];
	isLoading: boolean;
	// Set when the history failed to load; retries the call.
	error?: { onRetry: () => void };
	historyWindow: HistoryWindow;
	onHistoryWindowChange: (historyWindow: HistoryWindow) => void;
};

// Past Bonuses in a date range, the last 90 days unless the player picks other dates.
export function ExpiredBonuses({
	bonuses,
	isLoading,
	error,
	historyWindow,
	onHistoryWindowChange,
}: Props) {
	return (
		<section className={classes.section} aria-labelledby="expired-title">
			<Title order={2} id="expired-title" className={classes.sectionTitle}>
				Expired
			</Title>
			<div className={classes.filters}>
				<DateInput
					label="From"
					value={historyWindow.from}
					maxDate={historyWindow.to}
					onChange={(from) =>
						from && onHistoryWindowChange({ ...historyWindow, from })
					}
				/>
				<DateInput
					label="To"
					value={historyWindow.to}
					minDate={historyWindow.from}
					onChange={(to) =>
						to && onHistoryWindowChange({ ...historyWindow, to })
					}
				/>
			</div>
			{isLoading ? (
				<Skeleton height={LOADING_HEIGHT} radius="lg" />
			) : error ? (
				<LoadError onRetry={error.onRetry} />
			) : bonuses.length === 0 ? (
				<div className={classes.empty}>
					<Text className={classes.lead}>
						No past Bonuses between these dates. Pick earlier dates to see more.
					</Text>
				</div>
			) : (
				<ul className={classes.expiredList}>
					{bonuses.map((bonus) => (
						<li key={bonus.id} className={classes.expiredRow}>
							<span className={classes.expiredName}>{bonus.planName}</span>
							<span>{formatNumByCurrency(bonus.amount, bonus.currency)}</span>
							<Badge variant="default" tt="none">
								{bonus.status}
							</Badge>
							<span className={classes.expiredDate}>
								Started {bonus.triggered}
							</span>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
