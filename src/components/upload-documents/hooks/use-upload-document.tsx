import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useSession } from "@/providers/authentication/authentication";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG";
import { ipsErrorMessage } from "@/server/IPS/ips-error-toast.tsx";

export type UploadDocumentProps = {
	documentType: string;
	issueDate?: string | Date;
	expiryDate?: string | Date;
	documentNumber?: string;
	files: File[];
};

export const useUploadDocument = () => {
	const { session } = useSession();
	const queryClient = useQueryClient();

	const createFormData = (data: UploadDocumentProps) => {
		const formData = new FormData();
		formData.append("documentType", data.documentType);

		if (data.issueDate) {
			const formattedIssueDate = dayjs(data.issueDate).format("YYYY-MM-DD");
			formData.append("issueDate", formattedIssueDate);
		}

		if (data.expiryDate) {
			const formattedExpiryDate = dayjs(data.expiryDate).format("YYYY-MM-DD");
			formData.append("expiryDate", formattedExpiryDate);
		}

		if (data.documentNumber) {
			formData.append("documentNumber", data.documentNumber);
		}

		// For multiple files, create fileMap and use _file_n format
		if (data.files.length > 1) {
			const fileMap: Record<string, string> = {};
			data.files.forEach((file, index) => {
				fileMap[file.name] = index === 0 ? "FRONT" : "BACK";
				formData.append(`_file_${index}`, file);
			});
			formData.append("fileMap", JSON.stringify(fileMap));
			// formData.append("id", "1893"); // Add the required id field
		} else {
			// Single file upload remains the same
			formData.append("file", data.files[0]);
		}

		return formData;
	};
	return useMutation({
		mutationKey: ["upload-document"],
		mutationFn: async (data: UploadDocumentProps) => {
			const API =
				data.files.length > 1
					? "/uploadMultiUserDocument"
					: "/uploadUserDocument";

			try {
				const formData = createFormData(data);
				const res = await IPS_AXIOS_CLIENT.post(API, formData, {
					params: {
						sessionKey: session?.user?.sessionKey,
					},
					headers: {
						"Content-Type": "multipart/form-data",
					},
				});
				return res.data;
			} catch (e) {
				console.error("Error uploading document:", e);
				throw e;
			}
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["Get-DOCUMENTS"],
			});
			notifications.show({
				message: "Document uploaded successfully",
				color: "neon",
				icon: <IconCheck />,
			});
		},
		onError: (error) => {
			if (error instanceof IPSErrors) {
				notifications.show({
					message: ipsErrorMessage(
						error,
						error.formatErrors() || error.message,
					),
					color: "danger",
					icon: <IconX />,
				});
			} else {
				notifications.show({
					message: "An unexpected error occurred",
					color: "danger",
					icon: <IconX />,
				});
			}
		},
	});
};
