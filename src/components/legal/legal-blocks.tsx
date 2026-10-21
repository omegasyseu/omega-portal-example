import {
	Anchor,
	Blockquote,
	Code,
	List,
	Text,
	Title,
	type TitleOrder,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { createContext, type ReactNode, use } from "react";
import { legalLinkHref } from "@/components/legal/legal-page-model.ts";
import type {
	BlocksBody,
	BlocksInline,
	BlocksList,
	BlocksNode,
	BlocksText,
} from "@/server/STRAPI/strapi-blocks.ts";

// Draws a Legal Page's Strapi Blocks body with the portal's typography. Node types the
// portal doesn't draw (images among them) were read as "unsupported" and draw nothing.
// The body never changes order while shown, so list positions are stable keys.

const textMarks = (node: BlocksText): ReactNode => {
	let shown: ReactNode = node.text;
	if (node.code) shown = <Code>{shown}</Code>;
	if (node.bold) shown = <strong>{shown}</strong>;
	if (node.italic) shown = <em>{shown}</em>;
	if (node.underline) shown = <u>{shown}</u>;
	if (node.strikethrough) shown = <s>{shown}</s>;
	return shown;
};

// True where following a link in place would lose something under it, such as the
// dialog over a sign-up form: links to the portal's own pages then open a new tab too.
export const LegalLinksInNewTab = createContext(false);

const LegalLink = ({ url, children }: { url: string; children: ReactNode }) => {
	const href = legalLinkHref(url);
	const isNewTab = use(LegalLinksInNewTab);
	if (!href) return children;
	if (href.startsWith("/") && !isNewTab) {
		// href, not to: the router reads a path's ?query and #hash apart from it only then.
		return (
			<Anchor component={Link} href={href}>
				{children}
			</Anchor>
		);
	}
	// An email or phone link opens the visitor's app, so it needs no tab of its own.
	if (/^(mailto|tel):/i.test(href))
		return <Anchor href={href}>{children}</Anchor>;
	return (
		<Anchor href={href} target="_blank" rel="noopener noreferrer">
			{children}
		</Anchor>
	);
};

const Inline = ({ nodes }: { nodes: BlocksInline[] }) =>
	nodes.map((node, index) => {
		// A link's key holds its URL too: the router's Link doesn't re-read a changed href.
		const key = `${node.type}-${index}`;
		if (node.type === "text") return <span key={key}>{textMarks(node)}</span>;
		if (node.type === "link") {
			return (
				<LegalLink key={`${key}-${node.url}`} url={node.url}>
					{node.children.map((child, childIndex) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: a body's nodes have no id and never reorder
						<span key={`text-${childIndex}`}>{textMarks(child)}</span>
					))}
				</LegalLink>
			);
		}
		return null;
	});

const BlocksListView = ({ list }: { list: BlocksList }) => (
	<List
		type={list.format === "ordered" ? "ordered" : "unordered"}
		withPadding
		spacing="xs"
	>
		{list.children.map((item, index) => {
			const key = `${item.type}-${index}`;
			if (item.type === "list-item") {
				return (
					<List.Item key={key}>
						<Inline nodes={item.children} />
					</List.Item>
				);
			}
			// A nested list sits in its own item, as HTML allows only <li> in a list.
			if (item.type === "list") {
				return (
					<List.Item key={key} style={{ listStyleType: "none" }}>
						<BlocksListView list={item} />
					</List.Item>
				);
			}
			return null;
		})}
	</List>
);

// The page's own title is the only h1, so a body heading starts at h2, drawn a size
// smaller so it stays below the title.
const headingOrder = (level: number) => Math.max(level, 2) as TitleOrder;
const headingSize = (order: TitleOrder) => `h${Math.min(order + 1, 6)}`;

const Block = ({ node }: { node: BlocksNode }) => {
	switch (node.type) {
		case "heading":
			return (
				<Title
					order={headingOrder(node.level)}
					size={headingSize(headingOrder(node.level))}
					mt="md"
				>
					<Inline nodes={node.children} />
				</Title>
			);
		case "paragraph":
			return (
				<Text>
					<Inline nodes={node.children} />
				</Text>
			);
		case "quote":
			return (
				<Blockquote>
					<Inline nodes={node.children} />
				</Blockquote>
			);
		case "code":
			return (
				<Code block>
					<Inline nodes={node.children} />
				</Code>
			);
		case "list":
			return <BlocksListView list={node} />;
		default:
			return null;
	}
};

export const LegalBlocks = ({ body }: { body: BlocksBody }) =>
	body.map((node, index) => (
		// biome-ignore lint/suspicious/noArrayIndexKey: a body's nodes have no id and never reorder
		<Block key={`${node.type}-${index}`} node={node} />
	));
