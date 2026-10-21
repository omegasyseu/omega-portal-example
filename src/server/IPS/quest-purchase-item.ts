import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG";

export async function questPurchaseItem({
	sessionKey,
	itemId,
	level,
}: {
	sessionKey: string;
	itemId: string;
	level: number;
}) {
	if (!sessionKey || !itemId) {
		throw new Error("Missing sessionKey, itemId, or level");
	}
	const response = await IPS_AXIOS_CLIENT.get("/quest/purchaseItem", {
		params: { sessionKey, itemId, level },
	});
	return response.data;
}
