import dayjs from "dayjs";

export const Five_MINUTES = 1000 * 60 * 5;

const today = dayjs().toDate();
const tomorrow = dayjs().add(1, "day").toDate();
const yesterday = dayjs().subtract(1, "day").toDate();
const oneWeekAgo = dayjs().subtract(1, "week").toDate();
const firstDayOfMonth = dayjs().startOf("month").toDate();
const lastDayOfMonth = dayjs().endOf("month").toDate();

export {
	firstDayOfMonth,
	lastDayOfMonth,
	oneWeekAgo,
	today,
	tomorrow,
	yesterday,
};
