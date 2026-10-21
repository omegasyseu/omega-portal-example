import { Badge, Button, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createColumnHelper } from "@tanstack/react-table";
import dayjs from "dayjs";
import type { z } from "zod";
import engage from "@/components/engage/engage.module.css";
import { ReusableTransactionTable } from "@/components/table/basic";
import type { PortalTableFeatures } from "@/components/table/features";
import { documentStatusBadge } from "@/components/upload-documents/document-status.ts";
import {
	type DocumentResponse,
	useGetDocuments,
} from "@/components/upload-documents/queries/get-upload-document";
import UploadModal from "@/components/upload-documents/upload-modal";
import { parseDateString } from "@/utils/date.ts";
import classes from "./upload-documents.module.css";

type UserDocument = z.infer<typeof DocumentResponse>["userDocuments"][0];

const formatDate = (dateString: string | null | undefined): string => {
	if (!dateString) return "-";
	const date = parseDateString(dateString);
	return dayjs(date).format("DD-MM-YYYY HH:mm:ss");
};

const columnHelper = createColumnHelper<PortalTableFeatures, UserDocument>();

export const documentColumns = [
	columnHelper.accessor("documentType", {
		header: "Document Type",
		cell: (info) => (
			<Text fz="sm" ta="center">
				{info.getValue()}
			</Text>
		),
	}),
	columnHelper.accessor("uploadDate", {
		header: "Upload Date",
		cell: (info) => (
			<Text fz="sm" ta="center">
				{formatDate(info.getValue())}
			</Text>
		),
	}),
	columnHelper.accessor("issueDate", {
		header: "Issue Date",
		cell: (info) => (
			<Text fz="sm" ta="center">
				{formatDate(info.getValue())}
			</Text>
		),
	}),
	columnHelper.accessor("expiryDate", {
		header: "Expiry Date",
		cell: (info) => (
			<Text fz="sm" ta="center">
				{formatDate(info.getValue())}
			</Text>
		),
	}),
	columnHelper.accessor("status", {
		header: "Status",
		cell: (info) => {
			const badge = documentStatusBadge(info.getValue());
			return (
				<Badge
					color={badge.color}
					variant="light"
					radius="sm"
					fullWidth
					classNames={{ root: classes.status, label: classes.statusLabel }}
				>
					{badge.label}
				</Badge>
			);
		},
	}),
	columnHelper.accessor("fileName", {
		header: "File Name",
		cell: ({ cell }) => (
			<Tooltip label={cell.getValue()}>
				<Text fz="sm" ta="center" truncate="end">
					{cell.getValue()}
				</Text>
			</Tooltip>
		),
	}),
];

export const UploadDocumentsView = () => {
	const { data, isLoading, isFetching } = useGetDocuments();
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<div className={engage.panel}>
			<div className={classes.header}>
				<Text className={`${engage.lead} ${classes.lead}`}>
					Upload a document so we can verify your identity. Pick its type, then
					add an image, PDF, Word, Excel or PowerPoint file of up to 5 MB.
				</Text>
				<Button onClick={open} className={classes.upload}>
					Upload document
				</Button>
			</div>

			<ReusableTransactionTable
				data={data?.userDocuments || []}
				columns={documentColumns}
				isLoading={isLoading || isFetching}
				tableGridWrapper={{
					cols: 6,
				}}
			/>

			<UploadModal opened={opened} close={close} />
		</div>
	);
};

export default UploadDocumentsView;
