import { Stack, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";
import engage from "@/components/engage/engage.module.css";
import ErrorInfo from "@/components/error-info";
import { ExportCsvButton } from "@/components/export-csv-button";
import {
	type TransactionType as GamingHistoryRow,
	gamingHistoryColumns,
} from "@/components/profile/gaming-history/component/columns/gaming-history.tsx";
import {
	HistoryFilter,
	INITIAL_PERIOD,
} from "@/components/profile/history/history-filter.tsx";
import {
	historyDayTimes,
	historyRange,
} from "@/components/profile/history-range.ts";
import { ReusableTransactionTable } from "@/components/table/basic";
import { IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";
import { useGetGamingHistory } from "@/server/IPS/profile-info/gaming-history.ts";
import type { CsvColumn } from "@/utils/csv";

export const HISTORY_PAGE_SIZE_OPTIONS = ["25", "50", "100", "250"];
export const HISTORY_INITIAL_PAGE_SIZE = 25;

const csvColumns: CsvColumn<GamingHistoryRow>[] = [
	{ key: "date", header: "date" },
	{ key: "game", header: "game" },
	{ key: "type", header: "type" },
	{ key: "amount", header: "amount" },
	{ key: "balance", header: "balance" },
	{ key: "id", header: "ID" },
];

const GamingHistoryFormAndTable = () => {
	const [opened, { toggle, close }] = useDisclosure(false);

	const form = useForm({
		// The same range the highlighted Month button sets.
		initialValues: historyRange(INITIAL_PERIOD, new Date()),
	});
	const dayTimes = historyDayTimes(form.values);
	const { data, isLoading, error, isFetching } = useGetGamingHistory({
		startDateTime: dayTimes.from,
		endDateTime: dayTimes.to,
	});

	const formattedError =
		error instanceof IPSErrors ? error?.formatErrors() : error?.message;

	const rows: GamingHistoryRow[] = data?.transactionList ?? [];
	const isEmpty = !isFetching && !error && rows.length === 0;
	const exportFilename = `gaming-history_${dayjs(form.values.from).format("YYYY-MM-DD")}_${dayjs(form.values.to).format("YYYY-MM-DD")}.csv`;

	return (
		<Stack gap="md" w="100%">
			<HistoryFilter
				form={form}
				isFetching={isFetching}
				actions={
					<ExportCsvButton
						rows={rows}
						columns={csvColumns}
						filename={exportFilename}
						isLoading={isLoading || isFetching}
					/>
				}
			/>
			{isEmpty ? (
				<Text className={engage.empty}>
					No games played in this period. Try a longer period.
				</Text>
			) : (
				<ReusableTransactionTable
					data={rows}
					columns={gamingHistoryColumns}
					isLoading={isLoading}
					pageSizeOptions={HISTORY_PAGE_SIZE_OPTIONS}
					initialPageSize={HISTORY_INITIAL_PAGE_SIZE}
				/>
			)}
			<ErrorInfo
				error={error}
				opened={opened}
				onClose={close}
				toggle={toggle}
				formatedError={formattedError}
			/>
		</Stack>
	);
};

export default GamingHistoryFormAndTable;
