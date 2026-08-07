const { escapeHtml } = require('./markdown');

function formatDate(iso) {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function layout(site, { title, description, canonical, body }) {
  const pageTitle = title === site.title ? site.title : `${title} · ${site.title}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="${escapeHtml(description || site.description)}">
<meta property="og:title" content="${escapeHtml(pageTitle)}">
<meta property="og:description" content="${escapeHtml(description || site.description)}">
<meta property="og:type" content="website">
${canonical ? `<link rel="canonical" href="${escapeHtml(site.url + canonical)}">` : ''}
<link rel="alternate" type="application/rss+xml" title="${escapeHtml(site.title)}" href="/feed.xml">
<link rel="stylesheet" href="/style.css">
</head>
<body>
<header class="site-header">
  <a class="site-title" href="/">${escapeHtml(site.title)}</a>
  <nav>
    <a href="/">Posts</a>
    <a href="/about/">About</a>
    <a href="/feed.xml">RSS</a>
  </nav>
</header>
<main>
${body}
</main>
<footer class="site-footer">
  <p>© ${new Date().getFullYear()} ${escapeHtml(site.author)}. Built with a tiny static generator.</p>
</footer>
</body>
</html>
`;
}

function postCard(post) {
  return `<article class="post-card">
  <h2><a href="${post.url}">${escapeHtml(post.title)}</a></h2>
  <p class="meta"><time datetime="${post.date}">${formatDate(post.date)}</time>${
    post.tags.length ? ` · ${post.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join(' ')}` : ''
  }</p>
  <p>${escapeHtml(post.excerpt)}</p>
  <p><a class="read-more" href="${post.url}">Read post →</a></p>
</article>`;
}

function indexPage(site, posts) {
  const body = `<section class="intro">
  <h1>${escapeHtml(site.title)}</h1>
  <p>${escapeHtml(site.description)}</p>
</section>
${posts.length ? posts.map(postCard).join('\n') : '<p>No posts yet. Add a Markdown file to <code>posts/</code>.</p>'}`;
  return layout(site, { title: site.title, canonical: '/', body });
}

function postPage(site, post) {
  const body = `<article class="post">
  <h1>${escapeHtml(post.title)}</h1>
  <p class="meta"><time datetime="${post.date}">${formatDate(post.date)}</time> · ${escapeHtml(
    post.author || site.author
  )}${post.tags.length ? ` · ${post.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join(' ')}` : ''}</p>
  ${post.html}
</article>
<p class="back"><a href="/">← All posts</a></p>`;
  return layout(site, {
    title: post.title,
    description: post.excerpt,
    canonical: post.url,
    body,
  });
}

function aboutPage(site, html) {
  return layout(site, {
    title: 'About',
    canonical: '/about/',
    body: `<article class="post">${html}</article>`,
  });
}

function feed(site, posts) {
  const items = posts
    .map(
      (post) => `  <item>
    <title>${escapeHtml(post.title)}</title>
    <link>${site.url}${post.url}</link>
    <guid>${site.url}${post.url}</guid>
    <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
    <description>${escapeHtml(post.excerpt)}</description>
  </item>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeHtml(site.title)}</title>
  <link>${site.url}</link>
  <description>${escapeHtml(site.description)}</description>
${items}
</channel>
</rss>
`;
}

module.exports = { layout, indexPage, postPage, aboutPage, feed, formatDate };
