#!/usr/bin/env node
// Builds the static site: reads posts/*.md, renders HTML into dist/.

const fs = require('fs');
const path = require('path');
const { renderMarkdown, parseFrontMatter } = require('./markdown');
const { indexPage, postPage, aboutPage, feed } = require('./templates');

const ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'posts');
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUT_DIR = path.join(ROOT, 'dist');

const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.json'), 'utf8'));

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function excerptFrom(body) {
  const paragraph = body
    .split('\n\n')
    .map((block) => block.trim())
    .find((block) => block && !block.startsWith('#') && !block.startsWith('```'));
  const text = (paragraph || '').replace(/[*`>_]/g, '').replace(/\s+/g, ' ');
  return text.length > 200 ? `${text.slice(0, 197)}...` : text;
}

function loadPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return fs
    .readdirSync(POSTS_DIR)
    .filter((name) => name.endsWith('.md'))
    .map((name) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, name), 'utf8');
      const { data, body } = parseFrontMatter(raw);

      if (String(data.draft) === 'true') return null;

      const title = data.title || path.basename(name, '.md');
      const slug = data.slug || slugify(title);
      const tags = Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [];

      return {
        title,
        slug,
        tags,
        author: data.author,
        date: data.date || '1970-01-01',
        excerpt: data.excerpt || excerptFrom(body),
        html: renderMarkdown(body),
        url: `/posts/${slug}/`,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function writeFile(relativePath, contents) {
  const target = path.join(OUT_DIR, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents);
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

function build() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const posts = loadPosts();

  writeFile('index.html', indexPage(site, posts));
  for (const post of posts) {
    writeFile(path.join('posts', post.slug, 'index.html'), postPage(site, post));
  }

  const aboutFile = path.join(ROOT, 'pages', 'about.md');
  if (fs.existsSync(aboutFile)) {
    const { body } = parseFrontMatter(fs.readFileSync(aboutFile, 'utf8'));
    writeFile(path.join('about', 'index.html'), aboutPage(site, renderMarkdown(body)));
  }

  writeFile('feed.xml', feed(site, posts.slice(0, 20)));
  writeFile(
    'sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${site.url}/</loc></url>
${posts.map((p) => `  <url><loc>${site.url}${p.url}</loc></url>`).join('\n')}
</urlset>
`
  );
  writeFile('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
  // GitHub Pages: keep Jekyll from reprocessing the generated output.
  writeFile('.nojekyll', '');

  copyDir(PUBLIC_DIR, OUT_DIR);

  console.log(`Built ${posts.length} post(s) into ${path.relative(ROOT, OUT_DIR)}/`);
}

build();
