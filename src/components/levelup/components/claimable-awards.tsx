import { Button, Flex, Text } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import dayjs from "dayjs";
import { useMemo } from "react";
import type { z } from "zod";
import { useRedeemLevelUp } from "@/components/levelup/hooks/redeem-level-up.tsx";
import { ReusableTransactionTable } from "@/components/table/basic";
import { TableCell } from "@/components/table/cell.tsx";
import type { PortalTableFeatures } from "@/components/table/features";
import type { ClaimableAwardsSchema } from "@/schemas-types/levelup";
import { codeLabel } from "@/utils/code-label.ts";

// Narrow enough that all four columns, Claim included, fit a 390px phone without a
// sideways scroll.
const AWARD_COLUMN_MIN_WIDTH = 72;

type Props = {
	claimableAwards: z.infer<typeof ClaimableAwardsSchema>;
	levelUpUUID?: string;
};
type ClaimableAward = {
	awardType: string;
	awardValue: string;
	creationDate: string;
	currency: string;
	level: number;
	redemptionBy: string;
	status: string;
};

export const formatTimestamp = (
	timestamp: string | null | undefined,
): string => {
	if (!timestamp) return "N/A";
	const parsed = dayjs(timestamp);
	if (!parsed.isValid()) return "Invalid date";
	return parsed.format("DD-MM-YYYY HH:mm:ss");
};

export const columnHelper = createColumnHelper<
	PortalTableFeatures,
	ClaimableAward
>();

const ClaimableAwardsTable = ({ claimableAwards, levelUpUUID }: Props) => {
	// Filter out any undefined values to ensure we only have valid awards
	const { mutate, isPending } = useRedeemLevelUp();
	const filteredAwards = useMemo(
		() =>
			(claimableAwards ?? []).filter(
				(award): award is ClaimableAward => award !== undefined,
			),
		[claimableAwards],
	);

	const columns = useMemo(
		() => [
			columnHelper.accessor("level", {
				header: "Level",
				sortFn: "basic",
				cell: ({ cell }) => {
					return (
						<Flex mx={"auto"} justify={"center"} gap={"xs"}>
							<Text fz="sm">{cell.getValue()}</Text>
						</Flex>
					);
				},
			}),
			columnHelper.accessor("awardType", {
				header: "Type",
				cell: (context) => <TableCell {...context} formatter={codeLabel} />,
			}),
			columnHelper.accessor("awardValue", {
				header: "Award value",
				cell: TableCell,
			}),
			columnHelper.display({
				header: "Actions",
				id: "Actions",
				cell: ({ row }) => {
					return (
						<Flex mx={"auto"} justify={"center"}>
							<Button
								mx={"auto"}
								size="xs"
								loading={isPending}
								disabled={isPending}
								onClick={() => {
									mutate({
										levelUpUUID: `${levelUpUUID}`,
										level: `${row.original.level}`,
										// level: "2000",
									});
								}}
							>
								Claim
							</Button>
						</Flex>
					);
				},
			}),
		],
		[isPending, levelUpUUID, mutate],
	);

	return (
		<ReusableTransactionTable
			tableGridWrapper={{
				cols: 4,
			}}
			columnMinWidth={AWARD_COLUMN_MIN_WIDTH}
			data={filteredAwards}
			columns={columns}
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

export default ClaimableAwardsTable;
