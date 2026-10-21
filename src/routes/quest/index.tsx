import { Flex } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import QuestContainer from "@/components/quest/quest-map-improved-2/QuestContainer";
import { requireSignIn } from "@/providers/authentication/require-sign-in.ts";

const QuestPage = () => {
	return (
		<Flex
			flex={1}
			maw={"100%"}
			mih={"inherit"}
			mx={"auto"}
			p={"md"}
			w={"100%"}
			style={{ overflow: "hidden" }}
		>
			<QuestContainer />
		</Flex>
	);
};

export const Route = createFileRoute("/quest/")({
	beforeLoad: requireSignIn,
	component: QuestPage,
});
