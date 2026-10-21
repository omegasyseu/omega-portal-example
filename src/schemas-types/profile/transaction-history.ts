import { z } from "zod";
import { BASE_RESPONSE_SCHEMA } from "@/schemas-types/base-responses";

const HISTORIES = z.array(
	z.object({
		id: z.number(),
		requestDate: z.string(),
		// Null until the transaction is processed (a pending withdrawal).
		processDate: z.string().nullable(),
		type: z.string(),
		method: z.string(),
		amount: z.string(),
		amountPlayableBonus: z.string(),
		currency: z.string(),
		balance: z.string(),
		preBalance: z.string(),
		status: z.string(),
		paymentMethod: z.string(),
		requestMethodCode: z.null(),
		fee: z.string(),
		subMethod: z.null(),
		taxType: z.null(),
		taxAmount: z.null(),
		pspService: z.null(),
		escrowId: z.null(),
		taxAmountNumber: z.null(),
		feeNumber: z.number(),
		preBalanceNumber: z.number(),
		balanceNumber: z.number(),
		amountPlayableBonusNumber: z.number(),
		amountNumber: z.number(),
		playerMessage: z.null(),
		reference: z.null(),
		info: z.null(),
	}),
);

export const TransactionHistoryRes = z
	.object({
		histories: HISTORIES.optional(),
	})
	.merge(BASE_RESPONSE_SCHEMA);

export type TransactionHistoryType = z.infer<typeof TransactionHistoryRes>;

export const GAMEHISTORIES = z.array(
	z.object({
		id: z.number(),
		dateTime: z.string(),
		dateTimeFormatted: z.string(),
		tranType: z.string(),
		platformCode: z.string(),
		productCode: z.string(),
		segment: z.string(),
		gameLaunchId: z.string(),
		gameName: z.string(),
		amount: z.number(),
		amountReal: z.number(),
		amountBonus: z.number(),
		postBalance: z.number(),
		postBalanceReal: z.number(),
		postBalanceBonus: z.number(),
		gameTranId: z.string(),
		currency: z.string(),
		subProductCode: z.unknown(),
		paymentId: z.unknown(),
		paymentMethod: z.unknown(),
		paymentSubMethod: z.unknown(),
		taxType: z.unknown(),
		taxAmount: z.unknown(),
		reference: z.unknown(),
		escrowTranType: z.unknown(),
		escrowTranSubType: z.unknown(),
		escrowType: z.unknown(),
		escrowAmount: z.unknown(),
		escrowWithdrawableBalance: z.unknown(),
		escrowNonWithdrawableBalance: z.unknown(),
		escrowTransactionGroup: z.unknown(),
		transactionId: z.string(),
	}),
);
export type GamingHistoryType = z.infer<typeof GAMEHISTORIES>;

export const GamingHistoryRes = z
	.object({
		totalRecords: z.number(),
		transactionList: GAMEHISTORIES.optional(),
	})
	.merge(BASE_RESPONSE_SCHEMA);

export type GamingHistoryResType = z.infer<typeof GamingHistoryRes>;
