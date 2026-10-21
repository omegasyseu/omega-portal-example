import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import { createColumnHelper } from "@tanstack/react-table";
import classes from "@/components/profile/refer-a-friend/refer-a-friend.module.css";
import { TableCell } from "@/components/table/cell.tsx";
import type { PortalTableFeatures } from "@/components/table/features";
import type { Referee } from "@/schemas-types";

// The icon carries the answer, so screen readers get it as a "Yes"/"No" image.
const statusIcon = (isEligible: boolean) => (
	<div className={classes.statusIcon}>
		{isEligible ? (
			<IconCircleCheck className={classes.yes} role="img" aria-label="Yes" />
		) : (
			<IconCircleX className={classes.no} role="img" aria-label="No" />
		)}
	</div>
);
const columnHelper = createColumnHelper<PortalTableFeatures, Referee>();

export const refereesColumn = [
	columnHelper.accessor("userId", {
		header: "User ID",
		cell: (props) => (
			<TableCell
				{...props}
				tableTextProps={{
					style: {
						maxWidth: "100px",
						overflow: "hidden",
						textOverflow: "ellipsis",
					},
				}}
			/>
		),
	}),
	columnHelper.accessor("referEmail", {
		header: "Email",
		cell: (props) => (
			<TableCell
				{...props}
				tableTextProps={{
					ta: "center",
					style: {
						// maxWidth: '100px',
						overflow: "hidden",
						textOverflow: "ellipsis",
					},
				}}
			/>
		),
	}),
	columnHelper.accessor("referDate", {
		header: "Date",
		cell: (props) => (
			<TableCell
				{...props}
				tableTextProps={{
					ta: "center",
				}}
			/>
		),
	}),
	columnHelper.accessor("regStatus", {
		header: "Registered",
		cell: (props) => statusIcon(!!props.row.original.regStatus),
	}),
	columnHelper.accessor("kycpassed", {
		header: "KYC",
		cell: (props) => statusIcon(props.row.original.kycpassed),
	}),
	columnHelper.accessor("depositAmountPassed", {
		header: "Deposit",
		cell: (props) => statusIcon(props.row.original.depositAmountPassed),
	}),
	columnHelper.accessor("lockedStatusPassed", {
		header: "Lock status",
		cell: (props) => statusIcon(props.row.original.lockedStatusPassed),
	}),
	columnHelper.accessor("referralRewarded", {
		header: "Awarded",
		cell: (props) => statusIcon(props.row.original.referralRewarded),
	}),
];
