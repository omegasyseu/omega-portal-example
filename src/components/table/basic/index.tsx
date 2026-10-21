import {
	Box,
	Flex,
	Pagination,
	ScrollArea,
	Select,
	SimpleGrid,
	type SimpleGridProps,
	Text,
	VisuallyHidden,
} from "@mantine/core";
import { IconSortAscending, IconSortDescending } from "@tabler/icons-react";
import {
	type ColumnDef,
	flexRender,
	type TableState,
	useTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import {
	type PortalTableFeatures,
	portalTableFeatures,
} from "@/components/table/features";
import classes from "./basic-table.module.css";

const DEFAULT_COLUMNS = 6;
const DEFAULT_COLUMN_MIN_WIDTH = 110;

type TableProps<TData extends Record<string, unknown>> = {
	data: TData[];
	// biome-ignore lint/suspicious/noExplicitAny: columns hold any value type
	columns: ColumnDef<PortalTableFeatures, TData, any>[];
	pageSizeOptions?: string[];
	initialPageSize?: number;
	isLoading?: boolean;
	tableGridWrapper?: SimpleGridProps;
	initialState?: Partial<TableState<PortalTableFeatures>>;
	rowClassName?: string;
	headerClassName?: string;
	paginationSize?: "xs" | "sm" | "md" | "lg" | "xl";
	// The narrowest a column gets before the table scrolls sideways.
	columnMinWidth?: number;
};

export const ReusableTransactionTable = <
	TData extends Record<string, unknown>,
>({
	data,
	columns,
	//   we can pass our own basic-table settings if needed
	pageSizeOptions = ["5", "10", "15"],
	initialPageSize = 5,
	tableGridWrapper,
	initialState,
	rowClassName,
	headerClassName,
	paginationSize,
	columnMinWidth = DEFAULT_COLUMN_MIN_WIDTH,
}: TableProps<TData>) => {
	const defaultData = useMemo(() => [], []);

	const table = useTable({
		features: portalTableFeatures,
		columns,
		data: data ?? defaultData,
		initialState: {
			...initialState,
			pagination: {
				pageIndex: 0,
				pageSize: initialPageSize,
			},
		},
	});

	// cols can be responsive; a plain number is the column count, anything else the default.
	const columnCount =
		typeof tableGridWrapper?.cols === "number"
			? tableGridWrapper.cols
			: DEFAULT_COLUMNS;

	return (
		<ScrollArea
			maw={{
				base: "100%",
				md: "800px",
				lg: "100%",
			}}
			w={"100%"}
		>
			{/* Each column keeps a readable width; on a narrow screen the table scrolls
			    inside its own area instead of squeezing the headers together. */}
			<Box miw={columnCount * columnMinWidth}>
				{table.getHeaderGroups().map((headerGroup) => (
					<SimpleGrid
						cols={tableGridWrapper?.cols || DEFAULT_COLUMNS}
						key={headerGroup.id}
						className={classes.headerGroups}
						mb={5}
						px={4}
						{...tableGridWrapper}
					>
						{headerGroup.headers.map((header) => {
							const canSort = header.column.getCanSort();
							const sorted = header.column.getIsSorted();
							// A sortable header is a button, so the keyboard reaches it too.
							return (
								<Text
									component={canSort ? "button" : "p"}
									type={canSort ? "button" : undefined}
									w={header.getSize()}
									className={[
										classes.headerCell,
										canSort ? classes.sortable : null,
										headerClassName,
									]
										.filter(Boolean)
										.join(" ")}
									key={header.id}
									onClick={header.column.getToggleSortingHandler()}
								>
									{flexRender(
										header.column.columnDef.header,
										header.getContext(),
									)}
									{sorted === "asc" ? (
										<>
											<IconSortAscending aria-hidden />
											<VisuallyHidden>, sorted ascending</VisuallyHidden>
										</>
									) : null}
									{sorted === "desc" ? (
										<>
											<IconSortDescending aria-hidden />
											<VisuallyHidden>, sorted descending</VisuallyHidden>
										</>
									) : null}
								</Text>
							);
						})}
					</SimpleGrid>
				))}

				{table.getRowModel().rows.length === 0 ? (
					<Text className={classes.notFoundText}>Nothing to show yet.</Text>
				) : (
					<Box className={classes.rowsContainer}>
						{table.getRowModel().rows.map((row) => (
							<Box
								className={
									rowClassName
										? `${classes.rows} ${rowClassName}`
										: classes.rows
								}
								key={row.id}
							>
								{row.getVisibleCells().map((cell) => (
									<Box
										key={cell.id}
										w={"100%"}
										my={"xs"}
										style={{ overflowX: "hidden" }}
									>
										{flexRender(
											cell.column.columnDef.cell ?? cell.column.columnDef.cell,
											cell.getContext(),
										)}
									</Box>
								))}
							</Box>
						))}
					</Box>
				)}
			</Box>
			<Flex justify={"space-between"} mt={"sm"}>
				{table.getPaginatedRowModel().rows.length > 0 && (
					<Flex align={"center"} gap={"sm"} mt={"sm"}>
						<Text c={"dark.1"} fz={"sm"} aria-hidden>
							Rows per page
						</Text>
						<Select
							aria-label="Rows per page"
							radius={"md"}
							withCheckIcon={false}
							allowDeselect={false}
							classNames={{
								root: classes.selectRoot,
								input: classes.selectInput,
							}}
							data={pageSizeOptions}
							value={String(table.state.pagination.pageSize)}
							onChange={(value) => {
								if (value) {
									table.setPageSize(Number(value));
									table.setPageIndex(0);
								}
							}}
						/>
					</Flex>
				)}
				{table.getPageCount() > 1 && (
					<Pagination
						mt={"sm"}
						radius={"lg"}
						value={table.state.pagination.pageIndex + 1}
						onChange={(page) => table.setPageIndex(page - 1)}
						total={table.getPageCount()}
						withEdges
						size={paginationSize}
					/>
				)}
			</Flex>
		</ScrollArea>
	);
};
