import type { UseQueryResult } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import type { z } from "zod";
import { useFetchQuestInfo } from "@/components/quest/queries/fetch-quest";
import type { LevelUpDataType, LevelUpResponse } from "@/schemas-types/levelup";

type QuestInfoData = z.infer<typeof LevelUpResponse>;

interface QuestInfoContextValue {
	questInfo: UseQueryResult<QuestInfoData, Error>;
	includeRedeemedAwards: boolean;
	getQuestById: (configurationId: string) => LevelUpDataType | undefined;
	getQuestByIndex: (index: number) => LevelUpDataType | undefined;
	questCount: number;
}

interface QuestInfoProviderProps {
	children: ReactNode;
	includeRedeemedAwards?: boolean;
}

const QuestInfoContext = createContext<QuestInfoContextValue | undefined>(
	undefined,
);

export function QuestInfoProvider({
	children,
	includeRedeemedAwards = false,
}: QuestInfoProviderProps) {
	const questInfo = useFetchQuestInfo({ includeRedeemedAwards });

	const value: QuestInfoContextValue = useMemo(() => {
		const quests = questInfo.data?.data || [];

		return {
			questInfo,
			includeRedeemedAwards,
			getQuestById: (configurationId: string) => {
				return quests.find(
					(quest: LevelUpDataType) => quest.configurationId === configurationId,
				);
			},
			getQuestByIndex: (index: number) => {
				return quests[index];
			},
			questCount: quests.length,
		};
	}, [questInfo, includeRedeemedAwards]);

	return (
		<QuestInfoContext.Provider value={value}>
			{children}
		</QuestInfoContext.Provider>
	);
}

export function useQuestInfo() {
	const context = useContext(QuestInfoContext);
	if (!context) {
		throw new Error("useQuestInfo must be used within a QuestInfoProvider");
	}
	return context;
}

export function useQuestInfoData() {
	const { questInfo } = useQuestInfo();
	return questInfo.data;
}

export function useQuestInfoQuery() {
	const { questInfo } = useQuestInfo();
	return questInfo;
}

export function useQuestById(configurationId: string) {
	const { getQuestById } = useQuestInfo();
	return getQuestById(configurationId);
}

export function useQuestByIndex(index: number) {
	const { getQuestByIndex } = useQuestInfo();
	return getQuestByIndex(index);
}

export function useQuestCount() {
	const { questCount } = useQuestInfo();
	return questCount;
}
