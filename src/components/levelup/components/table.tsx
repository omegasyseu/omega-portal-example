import { NumberFormatter, Text } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import dayjs from "dayjs";
import { useMemo } from "react";
import type { z } from "zod";
import { ReusableTransactionTable } from "@/components/table/basic";
import { TableCell } from "@/components/table/cell.tsx";
import type { PortalTableFeatures } from "@/components/table/features";
import { getCurrencyFromMap } from "@/hooks/use-format/fomatCurrencySymbol";
import type { RedeemAwardsSchema } from "@/schemas-types/levelup";
import { codeLabel } from "@/utils/code-label.ts";
import { readIpsDate } from "@/utils/date.ts";

type Props = {
	redeemedAwards: z.infer<typeof RedeemAwardsSchema>;
};

// free spin count -> rounds
// free spin amount -> round amount
// game name ->
type Award = {
	awardType: string;
	awardValue: string;
	currency: string;
	status: string;
	creationDate: string;
	redemptionBy: string;
	level: number;
	redemptionDate: string;
	rounds: number;
	roundAmount: number;
	gameName: string;
};

export const formatTimestamp = (
	timestamp: string | null | undefined,
): string => {
	if (!timestamp) return "N/A";
	const parsed = readIpsDate(timestamp);
	if (!parsed) return "Invalid date";
	return dayjs(parsed).format("DD-MM-YYYY HH:mm:ss");
};

// Create a column helper for a single Award, not an array of Awards
export const columnHelper = createColumnHelper<PortalTableFeatures, Award>();

export const RedeemedAwardColumn = [
	columnHelper.accessor("level", {
		header: "Level",
		sortFn: "basic",
		cell: TableCell,
	}),
	columnHelper.accessor("awardType", {
		header: "Award type",
		cell: (context) => <TableCell {...context} formatter={codeLabel} />,
	}),
	columnHelper.accessor("gameName", {
		header: "Game",
		cell: TableCell,
	}),
	columnHelper.accessor("rounds", {
		header: "Free spin count",
		cell: TableCell,
	}),
	columnHelper.accessor("roundAmount", {
		header: "Free spin amount",
		cell: ({ cell, row }) => {
			return (
				<Text fz={"sm"} ta={"center"}>
					<NumberFormatter
						prefix={getCurrencyFromMap(row?.original?.currency)}
						thousandSeparator={","}
						decimalScale={2}
						value={cell.getValue()}
					/>
				</Text>
			);
		},
	}),

	columnHelper.accessor("redemptionDate", {
		header: "Awarded",

		cell: ({ cell }) => {
			return (
				<Text fz={"sm"} ta={"center"}>
					{formatTimestamp(cell.getValue())}
				</Text>
			);
		},
	}),
];

const RedeemAwards = ({ redeemedAwards }: Props) => {
	const filteredAwards = useMemo(
		() =>
			(redeemedAwards ?? []).filter(
				(award): award is Award => award !== undefined,
			),
		[redeemedAwards],
	);

	return (
		<ReusableTransactionTable
			data={filteredAwards}
			columns={RedeemedAwardColumn}
			initialState={{
				sorting: [
					{
						id: "level",
						desc: true,
					},
				],
			}}
		/>
	);
};

export default RedeemAwards;
