// The server's date.pattern registry sets the format every IPS date comes back in, as a Java
// pattern ("MM-dd-yyyy HH:mm:ss"). These turn it into the dayjs formats that read those dates.

export type IpsDateFormats = {
	// Dates with a time, e.g. "12-31-2028 00:00:00".
	dateTime: string;
	// Dates without one, e.g. "12-31-2028".
	date: string;
};

// The format the portal assumed before the pattern could be set.
const DEFAULT_PATTERN = "dd-MM-yyyy HH:mm:ss";
const DEFAULT_TIME = "HH:mm:ss";

// Java writes the year and the day of month in lower case; dayjs in upper case. Months, hours,
// minutes and seconds are written the same in both.
const toDayjsTokens = (javaPattern: string) =>
	javaPattern.replaceAll("y", "Y").replaceAll("d", "D");

export const toDayjsFormats = (
	javaPattern: string | undefined,
): IpsDateFormats => {
	const pattern = javaPattern?.trim() || DEFAULT_PATTERN;
	const [date, time = DEFAULT_TIME] = toDayjsTokens(pattern).split(" ");
	return { dateTime: `${date} ${time}`, date };
};
