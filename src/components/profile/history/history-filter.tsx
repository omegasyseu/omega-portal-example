import { Button, Loader, Text } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import dayjs from "dayjs";
import { type ReactNode, useState } from "react";
import engage from "@/components/engage/engage.module.css";
import {
	type HistoryPeriod,
	historyRange,
} from "@/components/profile/history-range.ts";
import { PortalDateInput } from "@/ui/form-inputs";
import classes from "./history-filter.module.css";

// Short enough to fit both dates side by side on a phone.
const DATE_FORMAT = "D MMM YYYY";

export type HistoryDates = { from: Date; to: Date };

const PERIODS: readonly { value: HistoryPeriod; label: string }[] = [
	{ value: "day", label: "Day" },
	{ value: "week", label: "Week" },
	{ value: "month", label: "Month" },
];

// The period the pages open on; their forms start from its range.
export const INITIAL_PERIOD: HistoryPeriod = "month";

type Props = {
	form: UseFormReturnType<HistoryDates>;
	isFetching: boolean;
	// Shown at the end of the row, such as the Export CSV button.
	actions: ReactNode;
};

// The filter row of Game history and Transaction history: the Day, Week and Month
// buttons and the From and To calendar fields, which both set the form's dates.
export const HistoryFilter = ({ form, isFetching, actions }: Props) => {
	// null once the player picks a date by hand: the range no longer matches a button.
	const [period, setPeriod] = useState<HistoryPeriod | null>(INITIAL_PERIOD);

	const pickPeriod = (picked: HistoryPeriod) => {
		setPeriod(picked);
		form.setValues(historyRange(picked, new Date()));
	};

	const dateInputProps = (field: keyof HistoryDates) => {
		const inputProps = form.getInputProps(field);
		return {
			...inputProps,
			onChange: (value: Date | null) => {
				setPeriod(null);
				// A picked day arrives as its midnight; To covers that whole day.
				inputProps.onChange(
					field === "to" && value ? dayjs(value).endOf("day").toDate() : value,
				);
			},
		};
	};

	return (
		<div className={engage.panel}>
			<div className={classes.filter}>
				<fieldset className={classes.field}>
					<Text component="legend" className={classes.label}>
						Period
					</Text>
					<div className={classes.periods}>
						{PERIODS.map(({ value, label }) => {
							const isPicked = value === period;
							return (
								<Button
									key={value}
									variant={isPicked ? "filled" : "default"}
									aria-pressed={isPicked}
									className={classes.periodButton}
									onClick={() => pickPeriod(value)}
								>
									{label}
								</Button>
							);
						})}
					</div>
				</fieldset>
				<div className={classes.dates}>
					<PortalDateInput
						className={classes.dateInput}
						label="From"
						valueFormat={DATE_FORMAT}
						maxDate={form.values.to}
						{...dateInputProps("from")}
					/>
					<PortalDateInput
						className={classes.dateInput}
						label="To"
						valueFormat={DATE_FORMAT}
						// The server's today can be the player's tomorrow; a day the server
						// hasn't reached yet just comes back empty.
						maxDate={dayjs().add(1, "day").toDate()}
						{...dateInputProps("to")}
					/>
				</div>
				<div className={classes.actions}>
					{isFetching ? <Loader size="sm" aria-label="Loading" /> : null}
					{actions}
				</div>
			</div>
		</div>
	);
};
