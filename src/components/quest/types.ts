// External libraries
import type { z } from "zod";

// Internal imports
import type { LevelupData } from "@/schemas-types/levelup";

export interface Props {
	isSmall?: boolean;
}

// Extend the base LevelupData type with additional quest-specific properties
export interface QuestLevelInfo extends z.infer<typeof LevelupData> {
	questPointBalanceHistory?: QuestPointHistory[];
	availablePurchaseItems?: AvailablePurchaseItem[];
	purchasedItems?: PurchasedItem[];
}

export interface QuestPointHistory {
	level: number;
	awardType: string;
	awardValue: string;
	redemptionDate: string;
	creationDate?: string;
}

export interface AvailablePurchaseItem {
	id: string;
	type: string;
	level?: number;
	price: number;
	quantity: number;
	amount: number;
	awardType?: string;
	description: string;
	availability?: {
		playerCanPurchase: number;
		playerMaxAllowed: number;
		playerPurchased: number;
		remainingGlobal: number;
		soldOut: boolean;
		totalQuantity: number;
	};
	playerPurchaseCount?: number;
}

export interface PurchasedItem {
	id: string;
	type: string;
	level?: number;
	price: number;
	amount: number;
	awardType?: string;
	creationDate: string;
}
