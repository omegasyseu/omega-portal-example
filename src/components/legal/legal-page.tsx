import { Text, Title } from "@mantine/core";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import { LegalBlocks } from "@/components/legal/legal-blocks.tsx";
import classes from "@/components/legal/legal-page.module.css";
import {
	legalPageFor,
	type ShownLegalPage,
} from "@/components/legal/legal-page-model.ts";
import { NothingFoundBackground } from "@/components/not-found/not-found.tsx";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";

// Strapi's date ("2026-10-20"); dayjs reads a date on its own as that day where the visitor is.
const lastUpdated = (updatedOn: string | null | undefined) => {
	const date = updatedOn ? dayjs(updatedOn) : undefined;
	return date?.isValid() ? date.format("D MMMM YYYY") : undefined;
};

export const legalPageTitle = (result: ShownLegalPage) =>
	result.kind === "page" ? result.page.title : result.title;

// A Legal Page under the heading given: on /legal/$page, and in the dialog sign-up opens,
// whose own title is the heading there.
export const LegalPageBody = ({
	result,
	heading,
}: {
	result: ShownLegalPage;
	heading?: ReactNode;
}) => {
	const updated =
		result.kind === "page" ? lastUpdated(result.page.updatedOn) : undefined;
	return (
		<>
			{heading || updated ? (
				<div>
					{heading}
					{updated ? (
						<Text className={classes.meta}>Last updated {updated}</Text>
					) : null}
				</div>
			) : null}
			{result.kind === "page" ? (
				<LegalBlocks body={result.page.body} />
			) : (
				<Text>This page is not available yet.</Text>
			)}
		</>
	);
};

// One of the Selected Brand's Legal Pages (/legal/$page), for anyone, signed in or not.
export const LegalPage = ({ slug }: { slug: string }) => {
	const result = legalPageFor(useBrandContent(), slug);

	if (result.kind === "not-found") return <NothingFoundBackground />;

	return (
		<article className={classes.page}>
			<LegalPageBody
				result={result}
				heading={
					<Title order={1} className={classes.title}>
						{legalPageTitle(result)}
					</Title>
				}
			/>
		</article>
	);
};
