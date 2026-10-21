import { useCookies } from "react-cookie";
import { z } from "zod";

export const TempInfoSaveSchema = z.object({
	username: z.string(),
	email: z.string().email(),
	password: z.string(),
	verificationTarget: z.string(),
	brandId: z.string(),
});

export type TempInfoSave = z.infer<typeof TempInfoSaveSchema>;

export const useTempInfo = () => {
	const [tempInfo, setTempInfo, removeTempInfo] = useCookies([
		"portal-5-temp-info",
	]);

	const setTempUserInfo = (data: TempInfoSave) => {
		const stringifiedData = JSON.stringify(data);
		setTempInfo("portal-5-temp-info", stringifiedData);
	};

	const resetTempInfo = () => {
		removeTempInfo("portal-5-temp-info");
	};

	const tempInfoUserRaw = tempInfo["portal-5-temp-info"];
	let tempInfoUser: TempInfoSave | null = null;

	if (tempInfoUserRaw) {
		try {
			const parsedData =
				typeof tempInfoUserRaw === "string"
					? JSON.parse(tempInfoUserRaw)
					: tempInfoUserRaw;
			tempInfoUser = TempInfoSaveSchema.parse(parsedData);
		} catch (e) {
			console.error("Invalid temp info data", e);
		}
	}

	return {
		tempInfoUser,
		setTempUserInfo,
		resetTempInfo,
	};
};
