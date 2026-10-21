import type { Schema } from '@strapi/strapi';

type Text = { type: 'text'; text: string; bold?: true };
type Inline = Text | { type: 'link'; url: string; children: Text[] };
type List = { type: 'list'; format: 'ordered' | 'unordered'; children: Array<{ type: 'list-item'; children: Inline[] }> };
type Block = { type: 'heading'; level: 1 | 2 | 3; children: Inline[] } | { type: 'paragraph'; children: Inline[] } | List;

// `**bold**` or `[text](url)`; anything else is plain text.
const INLINE = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;

const inline = (line: string): Inline[] => {
  const children: Inline[] = [];
  let at = 0;
  for (const match of line.matchAll(INLINE)) {
    if (match.index > at) children.push({ type: 'text', text: line.slice(at, match.index) });
    const [, bold, label, url] = match;
    children.push(
      bold !== undefined ? { type: 'text', text: bold, bold: true } : { type: 'link', url, children: [{ type: 'text', text: label }] },
    );
    at = match.index + match[0].length;
  }
  if (at < line.length) children.push({ type: 'text', text: line.slice(at) });
  return children;
};

const HEADING = /^(#{1,3}) (.*)$/;
const LIST_ITEM = /^(-|\d+\.) (.*)$/;

/**
 * Strapi Blocks (the rich-text field's JSON) from the seed's markdown subset: `#` to `###`
 * headings, paragraphs (lines up to a blank line, a heading or a list), `-` and `1.` lists,
 * `**bold**` and `[text](url)`. Nothing else is markdown to it.
 */
export const markdownBlocks = (markdown: string): Schema.Attribute.BlocksValue => {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  const endParagraph = () => {
    if (paragraph.length > 0) blocks.push({ type: 'paragraph', children: inline(paragraph.join(' ')) });
    paragraph = [];
  };
  for (const line of markdown.split('\n').map((raw) => raw.trim())) {
    const heading = HEADING.exec(line);
    const item = LIST_ITEM.exec(line);
    if (heading) {
      endParagraph();
      blocks.push({ type: 'heading', level: heading[1].length as 1 | 2 | 3, children: inline(heading[2]) });
    } else if (item) {
      endParagraph();
      const format: List['format'] = item[1] === '-' ? 'unordered' : 'ordered';
      const last = blocks[blocks.length - 1];
      const list: List = last?.type === 'list' && last.format === format ? last : { type: 'list', format, children: [] };
      if (list !== last) blocks.push(list);
      list.children.push({ type: 'list-item', children: inline(item[2]) });
    } else if (line === '') {
      endParagraph();
    } else {
      paragraph.push(line);
    }
  }
  endParagraph();
  // Strapi's type wants rel and target on every link, but its own editor saves links without them.
  return blocks as Schema.Attribute.BlocksValue;
};
