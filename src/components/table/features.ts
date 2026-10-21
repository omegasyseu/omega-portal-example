import {
	columnSizingFeature,
	columnVisibilityFeature,
	createPaginatedRowModel,
	createSortedRowModel,
	rowPaginationFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_basic,
	sortFn_datetime,
	sortFn_text,
	tableFeatures,
} from "@tanstack/react-table";

// The table features every portal table uses. The sort fns are the ones the
// default "auto" sort can pick, plus "basic", which some columns name directly.
export const portalTableFeatures = tableFeatures({
	rowSortingFeature,
	rowPaginationFeature,
	columnSizingFeature,
	columnVisibilityFeature,
	sortedRowModel: createSortedRowModel(),
	paginatedRowModel: createPaginatedRowModel(),
	sortFns: {
		alphanumeric: sortFn_alphanumeric,
		basic: sortFn_basic,
		datetime: sortFn_datetime,
		text: sortFn_text,
	},
});

export type PortalTableFeatures = typeof portalTableFeatures;
