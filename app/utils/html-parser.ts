import * as cheerio from 'cheerio';

interface TextBlock {
  id: string;
  text: string;
  tag: string;
  attributes: Record<string, string>;
}

export function extractEditableContent(html: string): TextBlock[] {
  const $ = cheerio.load(html);
  const textBlocks: TextBlock[] = [];
  let idCounter = 0;

  const elementsWithText = [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'button', 'a', 'li', 'td', 'th'
  ];

  function traverse(element: cheerio.Cheerio) {
    element.each((_, el) => {
      const tagName = el.tagName;
      if (elementsWithText.includes(tagName)) {
        const text = $(el).text().trim();
        if (text) {
          const attributes: Record<string, string> = {};
          for (const attr of Object.keys(el.attribs)) {
            attributes[attr] = el.attribs[attr];
          }
          textBlocks.push({
            id: `text-block-${idCounter++}`,
            text,
            tag: tagName,
            attributes,
          });
        }
      }
      if (el.children) {
        traverse($(el).children());
      }
    });
  }

  traverse($('body'));

  return textBlocks;
}

export function sanitizeHtml(html: string): string {
    const $ = cheerio.load(html);
    $('script').remove();
    $('style').remove();
    return $('body').html() || '';
}
