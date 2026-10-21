import { Button } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { type CsvColumn, downloadCsv, toCsv } from "@/utils/csv";

type Props<T extends Record<string, unknown>> = {
	rows: T[];
	columns: CsvColumn<T>[];
	filename: string;
	isLoading?: boolean;
	label?: string;
};

export const ExportCsvButton = <T extends Record<string, unknown>>({
	rows,
	columns,
	filename,
	isLoading = false,
	label = "Export CSV",
}: Props<T>) => {
	const handleExport = () => {
		const csv = toCsv(rows, columns);
		downloadCsv(filename, csv);
	};

	return (
		<Button
			type={"button"}
			variant={"default"}
			leftSection={<IconDownload size={16} />}
			disabled={isLoading || rows.length === 0}
			onClick={handleExport}
			style={{ flexShrink: 0 }}
		>
			{label}
		</Button>
	);
};
