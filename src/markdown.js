// Minimal Markdown renderer. Supports the subset a blog actually needs:
// headings, paragraphs, bold/italic, inline + fenced code, links, images,
// unordered/ordered lists, blockquotes and horizontal rules.

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

function escapeHtml(text) {
  return text.replace(/[&<>"]/g, (ch) => ESCAPES[ch]);
}

const CODE_MARK = "\u0000";

function inline(text) {
  let out = escapeHtml(text).split(CODE_MARK).join("");

  // Code spans are protected from further formatting.
  const codeSpans = [];
  out = out.replace(/`([^`]+)`/g, (_, code) => {
    codeSpans.push(code);
    return CODE_MARK + (codeSpans.length - 1) + CODE_MARK;
  });

  out = out
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');

  const marked = new RegExp(CODE_MARK + "(\\d+)" + CODE_MARK, "g");
  return out.replace(marked, (_, i) => `<code>${codeSpans[i]}</code>`);
}

function renderMarkdown(source) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    // Fenced code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const body = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1; // closing fence
      const cls = lang ? ` class="language-${escapeHtml(lang)}"` : '';
      html.push(`<pre><code${cls}>${escapeHtml(body.join('\n'))}</code></pre>`);
      continue;
    }

    // Heading
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    // Horizontal rule
    if (/^(---|\*\*\*)\s*$/.test(line)) {
      html.push('<hr>');
      i += 1;
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      const body = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        body.push(lines[i].replace(/^>\s?/, ''));
        i += 1;
      }
      html.push(`<blockquote>${renderMarkdown(body.join('\n'))}</blockquote>`);
      continue;
    }

    // Lists
    const bullet = /^[-*+]\s+/;
    const numbered = /^\d+\.\s+/;
    if (bullet.test(line) || numbered.test(line)) {
      const ordered = numbered.test(line);
      const marker = ordered ? numbered : bullet;
      const items = [];
      while (i < lines.length && marker.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(marker, ''))}</li>`);
        i += 1;
      }
      const tag = ordered ? 'ol' : 'ul';
      html.push(`<${tag}>${items.join('')}</${tag}>`);
      continue;
    }

    // Paragraph: consume until a blank line or a block-level starter.
    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('>') &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !bullet.test(lines[i]) &&
      !numbered.test(lines[i])
    ) {
      para.push(lines[i].trim());
      i += 1;
    }
    html.push(`<p>${inline(para.join(' '))}</p>`);
  }

  return html.join('\n');
}

// Front matter: `key: value` pairs between leading `---` fences.
function parseFrontMatter(source) {
  const normalized = source.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return { data: {}, body: normalized };
  }

  const end = normalized.indexOf('\n---', 4);
  if (end === -1) {
    return { data: {}, body: normalized };
  }

  const data = {};
  for (const line of normalized.slice(4, end).split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((item) => item.trim().replace(/^["'](.*)["']$/, '$1'))
        .filter(Boolean);
    }
    data[match[1]] = value;
  }

  return { data, body: normalized.slice(end + 4).replace(/^\n+/, '') };
}

module.exports = { renderMarkdown, parseFrontMatter, escapeHtml };
