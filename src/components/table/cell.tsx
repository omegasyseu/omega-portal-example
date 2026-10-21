import { Text, type TextProps } from "@mantine/core";
import type { Cell, Row } from "@tanstack/react-table";
import type { ReactNode } from "react";
import type { PortalTableFeatures } from "@/components/table/features";

// biome-ignore lint/suspicious/noExplicitAny: cells hold any column value type
type Props<TData extends Record<string, any>, TValue> = {
	cell: Cell<PortalTableFeatures, TData, TValue>;
	row: Row<PortalTableFeatures, TData>;
	className?: string;
	formatter?: (value: TValue) => ReactNode;
	tableTextProps?: TextProps;
};

// biome-ignore lint/suspicious/noExplicitAny: cells hold any column value type
export const TableCell = <TData extends Record<string, any>, TValue>({
	cell,
	className,
	formatter,
	tableTextProps,
}: Props<TData, TValue>) => {
	const defaultProps: TextProps = {
		fz: "sm",
		ta: "center",
	};
	const mergedProps = {
		...defaultProps,
		...tableTextProps,
	};

	return (
		<Text {...mergedProps} className={className}>
			{formatter ? formatter(cell.getValue()) : cell.getValue<string>()}
		</Text>
	);
};
