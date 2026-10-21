import { Anchor, Flex, Text } from "@mantine/core";
import { useState } from "react";
import { LegalPageModal } from "@/components/legal/legal-page-modal.tsx";
import type { LegalPageSlug } from "@/components/legal/legal-page-model.ts";

export const TermsAndCondition = () => {
	const [shownPage, setShownPage] = useState<LegalPageSlug>();
	return (
		<Flex
			style={{
				flexWrap: "wrap",
			}}
			align={"center"}
			gap={"xs"}
			fz={"sm"}
		>
			<Text component={"p"} c={"dark.1"} my={0}>
				I have read and agree to the{" "}
			</Text>
			<Anchor
				tt={"capitalize"}
				c={"dark.0"}
				td={"underline"}
				onClick={() => setShownPage("terms")}
				style={{ cursor: "pointer" }}
			>
				terms and conditions
			</Anchor>
			<Text c={"dark.1"}>And </Text>
			<Anchor
				tt={"capitalize"}
				c={"dark.0"}
				td={"underline"}
				onClick={() => setShownPage("privacy")}
			>
				privacy policy
			</Anchor>
			<LegalPageModal
				slug={shownPage}
				onClose={() => setShownPage(undefined)}
			/>
		</Flex>
	);
};

export const Marketing = () => {
	return (
		<Text fz={"md"} component={"p"} c={"dark.1"} my={0}>
			I consent to marketing communications
		</Text>
	);
};
