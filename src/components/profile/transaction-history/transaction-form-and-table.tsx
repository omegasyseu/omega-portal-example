import { Stack, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";
import engage from "@/components/engage/engage.module.css";
import ErrorInfo from "@/components/error-info";
import { ExportCsvButton } from "@/components/export-csv-button";
import {
	HISTORY_INITIAL_PAGE_SIZE,
	HISTORY_PAGE_SIZE_OPTIONS,
} from "@/components/profile/gaming-history/gaming-history-form.tsx";
import {
	HistoryFilter,
	INITIAL_PERIOD,
} from "@/components/profile/history/history-filter.tsx";
import {
	historyDays,
	historyRange,
} from "@/components/profile/history-range.ts";
import { transactionHistoryColumns } from "@/components/profile/transaction-history/components/columns/transaction-history-column.tsx";
import { ReusableTransactionTable } from "@/components/table/basic";
import { useSession } from "@/providers/authentication/authentication";
import { IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";
import { useGetTransactionHistory } from "@/server/IPS/profile-info/get-transaction-history.tsx";
import type { CsvColumn } from "@/utils/csv";

type TransactionHistoryRow = {
	date: string;
	type: string;
	amount: string;
	currency: string;
	method: string;
	id: number;
	status: string;
};

const csvColumns: CsvColumn<TransactionHistoryRow>[] = [
	{ key: "date", header: "date" },
	{ key: "type", header: "type" },
	{ key: "amount", header: "amount" },
	{ key: "method", header: "method" },
	{ key: "status", header: "status" },
	{ key: "id", header: "ID" },
];

const TransactionsFormAndTable = () => {
	const [opened, { toggle, close }] = useDisclosure(false);

	const form = useForm({
		// The same range the highlighted Month button sets.
		initialValues: historyRange(INITIAL_PERIOD, new Date()),
	});
	const days = historyDays(form.values);
	const { data, isLoading, error, isFetching } = useGetTransactionHistory({
		startDate: days.from,
		endDate: days.to,
		order: "DESC",
	});

	const formattedError =
		error instanceof IPSErrors ? error?.formatErrors() : error?.message;
	const { session } = useSession();

	const isSocialBrand = session?.user?.loggedInBrand?.isSocialBrand;

	const rows: TransactionHistoryRow[] =
		data?.histories
			?.filter((item) => {
				if (isSocialBrand) {
					return item.type !== "DEPOSIT";
				}
				return true;
			})
			.map((item) => {
				if (isSocialBrand) {
					if (item.type === "WITHDRAWAL")
						return { ...item, type: "REDEMPTION" };
				}
				return item;
			}) ?? [];
	const isEmpty = !isFetching && !error && rows.length === 0;
	const exportFilename = `transaction-history_${dayjs(form.values.from).format("YYYY-MM-DD")}_${dayjs(form.values.to).format("YYYY-MM-DD")}.csv`;

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
					No transactions in this period. Try a longer period.
				</Text>
			) : (
				<ReusableTransactionTable
					data={rows}
					columns={transactionHistoryColumns}
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

export default TransactionsFormAndTable;
