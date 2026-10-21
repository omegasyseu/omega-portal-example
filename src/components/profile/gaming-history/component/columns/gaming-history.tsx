import { createColumnHelper } from "@tanstack/react-table";
import { TableCell } from "@/components/table/cell.tsx";
import type { PortalTableFeatures } from "@/components/table/features";

export type TransactionType = {
	date: string;
	game: string;
	type: string;
	amount: string;
	balance: string;
	id: number;
	currency?: string;
};
const columnHelper = createColumnHelper<PortalTableFeatures, TransactionType>();
export const gamingHistoryColumns = [
	columnHelper.accessor("date", {
		header: "date",
		cell: TableCell,
	}),
	columnHelper.accessor("game", {
		header: "game",
		cell: TableCell,
	}),
	columnHelper.accessor("type", {
		header: "type",
		cell: TableCell,
	}),
	columnHelper.accessor("amount", {
		header: "amount",
		id: "amount",
		cell: TableCell,
		sortFn: (rowA, rowB, columnId) => {
			const rowAValue = Number(
				rowA.getValue<string>(columnId).replace(/[^0-9.-]+/g, ""),
			);
			const rowBValue = Number(
				rowB.getValue<string>(columnId).replace(/[^0-9.-]+/g, ""),
			);
			return rowAValue < rowBValue ? -1 : 1;
		},
	}),
	columnHelper.accessor("balance", {
		header: "balance",
		cell: TableCell,
	}),

	columnHelper.accessor("id", {
		header: "ID",
		cell: TableCell,
	}),
];
