export type CsvColumn<T> = { key: keyof T; header: string };

const UTF8_BOM = "﻿";
const LINE_ENDING = "\r\n";

const escapeCell = (value: unknown): string => {
	if (value === null || value === undefined) {
		return "";
	}
	const text = String(value);
	if (/[",\r\n]/.test(text)) {
		return `"${text.replace(/"/g, '""')}"`;
	}
	return text;
};

export const toCsv = <T extends Record<string, unknown>>(
	rows: T[],
	columns: CsvColumn<T>[],
): string => {
	const headerLine = columns.map((column) => escapeCell(column.header));
	const rowLines = rows.map((row) =>
		columns.map((column) => escapeCell(row[column.key])).join(","),
	);
	return [headerLine.join(","), ...rowLines].join(LINE_ENDING);
};

export const downloadCsv = (filename: string, csv: string): void => {
	if (typeof document === "undefined") {
		return;
	}
	const blob = new Blob([UTF8_BOM, csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.style.display = "none";
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
	URL.revokeObjectURL(url);
};
