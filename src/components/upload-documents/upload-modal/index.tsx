import {
	Box,
	Button,
	Group,
	Image,
	Modal,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
	Dropzone,
	type FileWithPath,
	IMAGE_MIME_TYPE,
	MS_EXCEL_MIME_TYPE,
	MS_POWERPOINT_MIME_TYPE,
	MS_WORD_MIME_TYPE,
	PDF_MIME_TYPE,
} from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { IconFile, IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useState } from "react";
import {
	type UploadDocumentProps,
	useUploadDocument,
} from "@/components/upload-documents/hooks/use-upload-document";
import { useGetDocumentTypes } from "@/components/upload-documents/queries/get-document-types";
import { today } from "@/utils/minutes.ts";

const ICON_SIZE = 32;
// Matches the "should not exceed 5mb" copy in the dropzones.
const MAX_FILE_BYTES = 5 * 1024 ** 2;

type Props = {
	opened: boolean;
	close: () => void;
};

interface FormValues {
	documentType: string;
	documentNumber: string;
	issueDate: string | Date;
	expiryDate: string | Date;
	files: FileWithPath[];
}

const UploadModal = ({ opened, close }: Props) => {
	const ACCEPT_FORMATS = [
		...IMAGE_MIME_TYPE,
		...PDF_MIME_TYPE,
		...MS_WORD_MIME_TYPE,
		...MS_EXCEL_MIME_TYPE,
		...MS_POWERPOINT_MIME_TYPE,
	];
	const isImage = (file: File) => {
		return IMAGE_MIME_TYPE.includes(
			file.type as (typeof IMAGE_MIME_TYPE)[number],
		);
	};

	const { data: documentTypes } = useGetDocumentTypes();
	const uploadMutation = useUploadDocument();
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);

	const form = useForm<FormValues>({
		initialValues: {
			documentType: "",
			documentNumber: "",
			issueDate: today,
			expiryDate: today,
			files: [],
		},
		validate: {
			documentType: (value) => (!value ? "Document type is required" : null),
			files: (value) => {
				if (!value.length) return "At least one file is required";
				const selectedDocType = documentTypes?.documentTypes.find(
					(type) => type.documentType === form.values.documentType,
				);
				if (selectedDocType?.multipleFileRequired && value.length !== 2) {
					return "Both sides of the ID are required";
				}
				return null;
			},
			// EXPIRTY DATE CANNOT BE TODAY
			expiryDate: (value) => {
				return dayjs(value).isAfter(dayjs(), "day")
					? null
					: "Expiry date must be after today";
			},
		},
	});

	const selectedDocType = documentTypes?.documentTypes.find(
		(type) => type.documentType === form.values.documentType,
	);

	const handleDrop = (droppedFiles: FileWithPath[]) => {
		// Clears previous previews
		previewUrls.forEach(URL.revokeObjectURL);

		// Creates new previews only for images
		const newPreviewUrls = droppedFiles.map((file) =>
			isImage(file) ? URL.createObjectURL(file) : "",
		);

		setPreviewUrls(newPreviewUrls);
		form.setFieldValue("files", droppedFiles);
	};

	const renderPreview = (file: File | undefined, previewUrl: string) => {
		if (!file) return null;

		if (isImage(file)) {
			return (
				<Image
					src={previewUrl}
					alt="Document"
					h={100}
					w={200}
					fit="contain"
					mx="auto"
				/>
			);
		}
		return (
			<Stack align="center" gap="xs">
				<IconFile
					size={ICON_SIZE}
					color="var(--mantine-primary-color-filled)"
					stroke={1.5}
				/>
				<Text size="sm" ta="center">
					{file.name}
				</Text>
			</Stack>
		);
	};

	const handleSubmit = form.onSubmit((values) => {
		const uploadData: UploadDocumentProps = {
			documentType: values.documentType,
			files: values.files,
		};

		if (selectedDocType?.documentNumberRequired && values.documentNumber) {
			uploadData.documentNumber = values.documentNumber;
		}

		if (selectedDocType?.issueDateRequired && values.issueDate) {
			uploadData.issueDate = values.issueDate;
		}

		if (selectedDocType?.expiryDateRequired && values.expiryDate) {
			uploadData.expiryDate = values.expiryDate;
		}

		uploadMutation.mutate(uploadData, {
			onSuccess: () => {
				previewUrls.forEach(URL.revokeObjectURL);
				setPreviewUrls([]);
				form.reset();
				close();
			},
		});
	});

	const renderDropzones = () => {
		if (selectedDocType?.multipleFileRequired) {
			return (
				<SimpleGrid cols={{ base: 1, xs: 2 }} spacing="xl" mt="md">
					{[0, 1].map((index) => (
						<Box key={index}>
							<Text size="sm" mb="xs" ta="center" fw="medium">
								Side {index + 1} of ID
							</Text>
							<Dropzone
								onDrop={(files) => {
									const newFiles = [...form.values.files];
									newFiles[index] = files[0];
									form.setFieldValue("files", newFiles.filter(Boolean));

									const newPreviewUrls = [...previewUrls];
									if (previewUrls[index]) {
										URL.revokeObjectURL(previewUrls[index]);
									}
									newPreviewUrls[index] = isImage(files[0])
										? URL.createObjectURL(files[0])
										: "";
									setPreviewUrls(newPreviewUrls);
								}}
								maxSize={MAX_FILE_BYTES}
								multiple={false}
								accept={ACCEPT_FORMATS}
								loading={uploadMutation.isPending}
							>
								<Group
									justify="center"
									gap="xl"
									mih={150}
									style={{ pointerEvents: "none" }}
								>
									<Dropzone.Accept>
										<IconUpload
											size={ICON_SIZE}
											color="var(--mantine-primary-color-filled)"
											stroke={1.5}
										/>
									</Dropzone.Accept>
									<Dropzone.Reject>
										<IconX
											size={ICON_SIZE}
											color="var(--mantine-color-danger-filled)"
											stroke={1.5}
										/>
									</Dropzone.Reject>
									<Dropzone.Idle>
										{form.values.files[index] ? (
											renderPreview(
												form.values.files[index],
												previewUrls[index],
											)
										) : (
											<IconPhoto
												size={ICON_SIZE}
												color="var(--mantine-color-dark-2)"
												stroke={1.5}
											/>
										)}
									</Dropzone.Idle>
									{!form.values.files[index] && (
										<Stack gap={0}>
											<Text size="sm" inline>
												Drop side {index + 1} here
											</Text>
											<Text size="xs" c="dark.1" inline mt={4}>
												File should not exceed 5mb
											</Text>
										</Stack>
									)}
								</Group>
							</Dropzone>
						</Box>
					))}
				</SimpleGrid>
			);
		}

		return (
			<Box mt="md">
				<Dropzone
					onDrop={handleDrop}
					maxSize={MAX_FILE_BYTES}
					multiple={false}
					accept={ACCEPT_FORMATS}
					loading={uploadMutation.isPending}
				>
					<Group
						justify="center"
						gap="xl"
						mih={220}
						style={{ pointerEvents: "none" }}
					>
						<Dropzone.Accept>
							<IconUpload
								size={ICON_SIZE}
								color="var(--mantine-primary-color-filled)"
								stroke={1.5}
							/>
						</Dropzone.Accept>
						<Dropzone.Reject>
							<IconX
								size={ICON_SIZE}
								color="var(--mantine-color-danger-filled)"
								stroke={1.5}
							/>
						</Dropzone.Reject>
						<Dropzone.Idle>
							{form.values.files[0] ? (
								renderPreview(form.values.files[0], previewUrls[0])
							) : (
								<IconPhoto
									size={ICON_SIZE}
									color="var(--mantine-color-dark-2)"
									stroke={1.5}
								/>
							)}
						</Dropzone.Idle>
						{!form.values.files[0] && (
							<Stack gap={0}>
								<Text size="sm" inline fw="medium">
									Upload your document
								</Text>
								<Text size="xs" c="dark.1" inline>
									Only one file can be uploaded
								</Text>
								<Text size="xs" c="dark.1" inline mt={4}>
									Accepted formats: Images, PDF, Word, Excel, PowerPoint
								</Text>
								<Text size="xs" c="dark.1" inline mt={4}>
									File should not exceed 5mb
								</Text>
							</Stack>
						)}
					</Group>
				</Dropzone>
			</Box>
		);
	};

	return (
		<Modal
			opened={opened}
			onClose={close}
			title="Upload Documents"
			centered
			closeOnClickOutside={false}
			size="lg"
		>
			<form onSubmit={handleSubmit}>
				<Select
					label="Document Type"
					placeholder="Select document type"
					data={
						documentTypes?.documentTypes.map((type) => ({
							value: type.documentType,
							label: type.documentType.replace(/_/g, " "),
						})) || []
					}
					required
					{...form.getInputProps("documentType")}
				/>

				{selectedDocType?.documentNumberRequired && (
					<TextInput
						label="Document Number"
						placeholder="Enter document number"
						mt="md"
						required
						{...form.getInputProps("documentNumber")}
					/>
				)}

				{selectedDocType?.issueDateRequired && (
					<DatePickerInput
						label="Issue Date"
						mt="md"
						required
						{...form.getInputProps("issueDate")}
					/>
				)}

				{selectedDocType?.expiryDateRequired && (
					<DatePickerInput
						label="Expiry Date"
						mt="md"
						required
						{...form.getInputProps("expiryDate")}
					/>
				)}

				{renderDropzones()}

				<Group justify="flex-end" mt="xl">
					<Button
						type="button"
						variant="default"
						onClick={() => {
							previewUrls.forEach(URL.revokeObjectURL);
							setPreviewUrls([]);
							form.reset();
							close();
						}}
						disabled={uploadMutation.isPending}
					>
						Cancel
					</Button>
					<Button type="submit" loading={uploadMutation.isPending}>
						Upload
					</Button>
				</Group>
			</form>
		</Modal>
	);
};

export default UploadModal;
