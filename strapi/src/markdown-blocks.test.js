'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { markdownBlocks } = require('./markdown-blocks.ts');

const text = (value, marks = {}) => ({ type: 'text', text: value, ...marks });

test('headings, paragraphs and both kinds of list become Strapi Blocks', () => {
  const markdown = [
    '# Title',
    '',
    '## Section',
    '',
    'A paragraph that runs',
    'over two lines.',
    'We may void a bet if it was placed:',
    '- in breach of these rules;',
    '- by someone else.',
    '',
    '### Steps',
    '',
    '1. First.',
    '2. Second.',
  ].join('\n');

  assert.deepEqual(markdownBlocks(markdown), [
    { type: 'heading', level: 1, children: [text('Title')] },
    { type: 'heading', level: 2, children: [text('Section')] },
    { type: 'paragraph', children: [text('A paragraph that runs over two lines. We may void a bet if it was placed:')] },
    {
      type: 'list',
      format: 'unordered',
      children: [
        { type: 'list-item', children: [text('in breach of these rules;')] },
        { type: 'list-item', children: [text('by someone else.')] },
      ],
    },
    { type: 'heading', level: 3, children: [text('Steps')] },
    {
      type: 'list',
      format: 'ordered',
      children: [
        { type: 'list-item', children: [text('First.')] },
        { type: 'list-item', children: [text('Second.')] },
      ],
    },
  ]);
});

test('bold text and links inside a line', () => {
  assert.deepEqual(markdownBlocks('- **Email**: write to [support](mailto:support@omegasys.eu).'), [
    {
      type: 'list',
      format: 'unordered',
      children: [
        {
          type: 'list-item',
          children: [
            text('Email', { bold: true }),
            text(': write to '),
            { type: 'link', url: 'mailto:support@omegasys.eu', children: [text('support')] },
            text('.'),
          ],
        },
      ],
    },
  ]);
});
