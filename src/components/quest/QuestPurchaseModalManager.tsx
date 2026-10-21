import { QuestPurchaseModal } from "@/components/notifications/QuestPurchaseModal";
import { questLevelUpStore, useQuestLevelUp } from "./quest-level-up-store";

export const QuestPurchaseModalManager = () => {
	const questLevelUp = useQuestLevelUp();

	return (
		<QuestPurchaseModal
			opened={questLevelUp !== null}
			onClose={questLevelUpStore.close}
			questId={questLevelUp?.questId}
			level={questLevelUp?.level}
		/>
	);
};
