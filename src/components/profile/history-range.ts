import dayjs from "dayjs";

// The Day, Week and Month buttons on Game history and Transaction history.
export type HistoryPeriod = "day" | "week" | "month";

const DAYS_IN_WEEK = 7;

// The dates each button sets: from the start of the period's first day up to now.
export const historyRange = (period: HistoryPeriod, now: Date) => {
	const today = dayjs(now).startOf("day");
	const from = {
		day: today,
		week: today.subtract(DAYS_IN_WEEK - 1, "day"),
		month: today.subtract(1, "month"),
	}[period];
	return { from: from.toDate(), to: now };
};

const API_DAY_FORMAT = "YYYY-MM-DD";

// IPS ignores any offset and reads history dates in the server's timezone, the one the
// rows are shown in. So send the picked days as written: converting them to UTC would
// move the range by the player's own offset.
export const historyDays = ({ from, to }: { from: Date; to: Date }) => ({
	from: dayjs(from).format(API_DAY_FORMAT),
	to: dayjs(to).format(API_DAY_FORMAT),
});

// Game history takes date-times rather than days: the whole of each picked day. IPS
// rejects a date-time without an offset, yet ignores the one it gets, so the "Z" is
// only there to pass validation. Rows carry milliseconds but IPS refuses them in the
// range, so the range ends at the start of the next day rather than at 23:59:59.
export const historyDayTimes = ({ from, to }: { from: Date; to: Date }) => {
	const days = historyDays({ from, to: dayjs(to).add(1, "day").toDate() });
	return { from: `${days.from}T00:00:00Z`, to: `${days.to}T00:00:00Z` };
};
