import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { getDatePattern } from "@/server/config.ts";
import { toDayjsFormats } from "@/utils/ips-date-pattern.ts";

dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

// The formats IPS dates come back in, set by the server's date.pattern (see DATE_PATTERN).
export const getIpsDateFormats = () => toDayjsFormats(getDatePattern());

// Formats an IPS date. Undefined when the date can't be read.
export const formatIpsDate = (
	value: string,
	format: string,
): string | undefined => {
	const date = dayjs(value, getIpsDateFormats().dateTime, true);
	return date.isValid() ? date.format(format) : undefined;
};

// Reads an IPS date with or without its time, strictly. Undefined when it can't be read.
export const readIpsDate = (
	value: string | null | undefined,
): Date | undefined => {
	if (!value) return undefined;
	const { dateTime, date: dateOnly } = getIpsDateFormats();
	const date = dayjs(value, [dateTime, dateOnly], true);
	return date.isValid() ? date.toDate() : undefined;
};

// Reads an IPS date with or without its time, strictly so a date in another format isn't
// rolled over into a wrong one. Falls back to today when it can't be read.
export const parseDateString = (
	dateString: string | null | undefined,
): Date => {
	return readIpsDate(dateString) ?? dayjs().toDate();
};

export interface TimeRemaining {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
	totalHours: number;
	totalMinutes: number;
	totalSeconds: number;
	isExpired: boolean;
	formattedString: string;
}

/**
 * Calculate time remaining between two dates
 *
 * @param endDate - End date string in the IPS date format
 * @param startDate - Optional start date (defaults to current time)
 * @param dateFormat - Date format pattern (defaults to the IPS date format)
 * @returns TimeRemaining object with detailed time breakdown
 *
 * @example
 * // Basic usage - time until quest ends
 * const questEndDate = "31-12-2025 23:59:59";
 * const timeRemaining = calculateTimeRemaining(questEndDate);
 * console.log(timeRemaining);
 * // Output:
 * // {
 * //   days: 139,
 * //   hours: 15,
 * //   minutes: 42,
 * //   seconds: 18,
 * //   totalHours: 3351,
 * //   totalMinutes: 201102,
 * //   totalSeconds: 12066138,
 * //   isExpired: false,
 * //   formattedString: "139d 15h 42m"
 * // }
 *
 * @example
 * // Different time scenarios and their formatted strings:
 *
 * // More than a day: "5d 14h 30m"
 * // Less than a day: "14h 30m"
 * // Less than an hour: "45m 30s"
 * // Only seconds: "45s"
 * // Expired: "Expired"
 *
 * @example
 * // Calculate total quest duration
 * const questStart = "01-08-2025 00:00:00";
 * const questEnd = "31-08-2025 23:59:59";
 * const duration = calculateTimeRemaining(questEnd, questStart);
 * // Output: { days: 30, hours: 23, minutes: 59, ... formattedString: "30d 23h 59m" }
 */
export const calculateTimeRemaining = (
	endDate: string,
	startDate?: string,
	dateFormat = getIpsDateFormats().dateTime,
): TimeRemaining => {
	const end = dayjs(endDate, dateFormat);
	const start = startDate ? dayjs(startDate, dateFormat) : dayjs();

	const diffInSeconds = end.diff(start, "second");
	const isExpired = diffInSeconds <= 0;

	if (isExpired) {
		return {
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			totalHours: 0,
			totalMinutes: 0,
			totalSeconds: 0,
			isExpired: true,
			formattedString: "Expired",
		};
	}

	const totalDays = Math.floor(diffInSeconds / 86400);
	const years = Math.floor(totalDays / 365);
	const days = totalDays % 365;
	const hours = Math.floor((diffInSeconds % 86400) / 3600);
	const minutes = Math.floor((diffInSeconds % 3600) / 60);
	const seconds = diffInSeconds % 60;

	let formattedString = "";
	if (years > 0) formattedString = `${years}y ${days}d ${hours}h`;
	else if (days > 0) formattedString = `${days}d ${hours}h ${minutes}m`;
	else if (hours > 0) formattedString = `${hours}h ${minutes}m`;
	else if (minutes > 0) formattedString = `${minutes}m ${seconds}s`;
	else formattedString = `${seconds}s`;

	return {
		days,
		hours,
		minutes,
		seconds,
		totalHours: Math.floor(diffInSeconds / 3600),
		totalMinutes: Math.floor(diffInSeconds / 60),
		totalSeconds: diffInSeconds,
		isExpired: false,
		formattedString,
	};
};

export interface FormattedDate {
	date: string;
	time: string;
	showTime: boolean;
}

/**
 * Format a date string into a relative or absolute format for display
 * Uses hybrid approach: relative time for recent dates, absolute for older
 *
 * @param dateStr - Date string to format
 * @param format - Date format pattern (defaults to auto-detect for ISO strings)
 * @param serverTimezone - Server timezone (defaults to "America/Vancouver"). Examples: "UTC", "America/Vancouver", "America/New_York"
 * @returns FormattedDate object with date label, time, and whether to show time
 *
 * @example
 * // Recent dates (relative time)
 * formatRelativeDate("19-08-2025 14:30:00") // Just now
 * formatRelativeDate("19-08-2025 14:00:00") // 30 minutes ago
 * formatRelativeDate("19-08-2025 10:00:00") // 4 hours ago
 *
 * @example
 * // Today/Yesterday with time
 * formatRelativeDate("19-08-2025 09:00:00") // Today at 09:00
 * formatRelativeDate("18-08-2025 15:30:00") // Yesterday at 15:30
 *
 * @example
 * // Within week (day name with time)
 * formatRelativeDate("15-08-2025 14:00:00") // Thursday at 14:00
 *
 * @example
 * // Older dates (absolute)
 * formatRelativeDate("01-08-2025 14:00:00") // Aug 1
 * formatRelativeDate("15-03-2024 14:00:00") // Mar 15, 2024
 *
 * @example
 * // Server timestamp conversion with timezone
 * formatRelativeDate("2025-08-19T14:30:00Z", undefined, "UTC") // Converts UTC to local time
 * formatRelativeDate("19-08-2025 14:00:00", "DD-MM-YYYY HH:mm:ss", "America/Vancouver") // Vancouver time to local
 */
export const formatRelativeDate = (
	dateStr: string,
	format?: string,
	serverTimezone = "America/Vancouver",
): FormattedDate => {
	// TODO: Make serverTimezone configurable and read from application environment variable
	// This would allow changing the server timezone without code modifications
	// Example: serverTimezone = import.meta.env.VITE_SERVER_TIMEZONE || "America/Vancouver"

	if (!dateStr) return { date: "Unknown", time: "", showTime: false };

	// Parse date with timezone support
	// Parse server timestamp in its timezone, then convert to client's local timezone
	const date = format
		? dayjs.tz(dateStr, format, serverTimezone).local()
		: dayjs.tz(dateStr, serverTimezone).local();

	// Check if date is valid
	if (!date.isValid()) {
		// Try alternative formats or default parsing with server timezone
		const fallbackDate = dayjs
			.tz(dateStr, getIpsDateFormats().dateTime, serverTimezone)
			.local();
		if (!fallbackDate.isValid()) {
			return { date: "Unknown", time: "", showTime: false };
		}
		// Use the fallback date directly instead of recursively calling
		// Continue processing with the successfully parsed fallback date
		const now = dayjs();
		const diffHours = now.diff(fallbackDate, "hour");
		const diffDays = now.diff(fallbackDate, "day");
		const diffMinutes = now.diff(fallbackDate, "minute");

		let dateLabel = "";
		let timeLabel = "";
		let showTime = true;

		if (diffMinutes < 1) {
			dateLabel = "Just now";
			showTime = false;
		} else if (diffMinutes < 60) {
			dateLabel = `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
			showTime = false;
		} else if (diffHours < 24) {
			dateLabel = `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
			showTime = false;
		} else if (fallbackDate.isSame(now, "day")) {
			// Today
			dateLabel = "Today";
			timeLabel = fallbackDate.format("HH:mm");
		} else if (fallbackDate.isSame(now.subtract(1, "day"), "day")) {
			// Yesterday
			dateLabel = "Yesterday";
			timeLabel = fallbackDate.format("HH:mm");
		} else if (diffDays < 7) {
			// Within the last week - show day name
			dateLabel = fallbackDate.format("dddd");
			timeLabel = fallbackDate.format("HH:mm");
		} else if (fallbackDate.isSame(now, "year")) {
			// Same year - show month and day
			dateLabel = fallbackDate.format("MMM D");
			showTime = false;
		} else {
			// Different year - show full date
			dateLabel = fallbackDate.format("MMM D, YYYY");
			showTime = false;
		}

		return { date: dateLabel, time: timeLabel, showTime };
	}

	const now = dayjs();
	const diffHours = now.diff(date, "hour");
	const diffDays = now.diff(date, "day");
	const diffMinutes = now.diff(date, "minute");

	let dateLabel = "";
	let timeLabel = "";
	let showTime = true;

	if (diffMinutes < 1) {
		dateLabel = "Just now";
		showTime = false;
	} else if (diffMinutes < 60) {
		dateLabel = `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
		showTime = false;
	} else if (diffHours < 24) {
		dateLabel = `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
		showTime = false;
	} else if (date.isSame(now, "day")) {
		// Today
		dateLabel = "Today";
		timeLabel = date.format("HH:mm");
	} else if (date.isSame(now.subtract(1, "day"), "day")) {
		// Yesterday
		dateLabel = "Yesterday";
		timeLabel = date.format("HH:mm");
	} else if (diffDays < 7) {
		// Within the last week - show day name
		dateLabel = date.format("dddd");
		timeLabel = date.format("HH:mm");
	} else if (date.isSame(now, "year")) {
		// Same year - show month and day
		dateLabel = date.format("MMM D");
		showTime = false;
	} else {
		// Different year - show full date
		dateLabel = date.format("MMM D, YYYY");
		showTime = false;
	}

	return { date: dateLabel, time: timeLabel, showTime };
};
