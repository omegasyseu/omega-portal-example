import type { AvailablePurchaseItem } from "@/components/quest/types";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG";

interface AvailablePurchaseItemsResponse {
	configurationId: string;
	configurationName: string;
	currentLevel: number;
	endDate: string;
	levels: Array<{
		accessible: boolean;
		itemCount: number;
		items: Array<{
			amount: number;
			availability: {
				playerCanPurchase: number;
				playerMaxAllowed: number;
				playerPurchased: number;
				remainingGlobal: number;
				soldOut: boolean;
				totalQuantity: number;
			};
			awardType: string;
			configurationId: string;
			configurationTypeId: string;
			description: string;
			id: string;
			level: number;
			playerPurchaseCount: number;
			price: number;
			type: string;
		}>;
		level: number;
		purchasedCount: number;
	}>;
	questPointBalance: number;
	startDate: string;
}

export interface AvailablePurchaseItemsData {
	items: AvailablePurchaseItem[];
	configurationName: string;
	questPointBalance: number;
}

export async function getAvailablePurchaseItems({
	sessionKey,
	configurationId,
	level,
}: {
	sessionKey: string;
	configurationId: string;
	level: number;
}): Promise<AvailablePurchaseItemsData> {
	if (!sessionKey || !configurationId || level === undefined) {
		throw new Error("Missing required parameters");
	}

	const response = await IPS_AXIOS_CLIENT.get<{
		data: AvailablePurchaseItemsResponse;
	}>("/quest/availablePurchaseItems", {
		params: { sessionKey, configurationId, level },
	});

	const responseData = response.data.data;

	// Extract items from the first level in the response
	// Since we pass a specific level, the API returns only that level
	const levelData = responseData?.levels?.[0];

	if (!levelData?.items) {
		return {
			items: [],
			configurationName: responseData?.configurationName || "",
			questPointBalance: responseData?.questPointBalance || 0,
		};
	}

	// Map the items to match the AvailablePurchaseItem interface
	const items = levelData.items.map((item) => ({
		id: item.id,
		type: item.type,
		level: item.level,
		price: item.price,
		quantity: item.availability?.totalQuantity || 0,
		amount: item.amount,
		awardType: item.awardType,
		description: item.description || "",
		availability: item.availability,
		playerPurchaseCount: item.playerPurchaseCount,
	}));

	return {
		items,
		configurationName: responseData.configurationName || "",
		questPointBalance: responseData.questPointBalance || 0,
	};
}
