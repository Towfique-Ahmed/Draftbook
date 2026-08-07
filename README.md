# Draftbook

A minimal blog you write in Markdown and publish as static HTML. No frameworks, no npm dependencies — just Node's standard library.

## Quick start

```bash
npm run dev     # preview at http://localhost:3000 (rebuilds on reload)
npm run build   # write the finished site to dist/
```

Node 18 or newer. There is nothing to install.

## Writing a post

```bash
npm run new -- "My post title"
```

This creates `posts/YYYY-MM-DD-my-post-title.md` with front matter ready to fill in. New posts are marked `draft: true`; delete that line when you want the post published.

You can also just add a `.md` file to `posts/` by hand:

```markdown
---
title: My post title
date: 2026-08-07
tags: [notes]
---

The body of the post, in Markdown.
```

### Front matter fields

| Field | Purpose |
| --- | --- |
| `title` | Post title. Falls back to the filename. |
| `date` | `YYYY-MM-DD`. Sorts the home page, newest first. |
| `tags` | List, e.g. `[guide, notes]`. Optional. |
| `slug` | Overrides the URL derived from the title. Optional. |
| `excerpt` | Overrides the auto-generated summary. Optional. |
| `draft` | `true` keeps the post out of the build. Optional. |

## Configuring the site

Edit `site.json` for the blog name, description, author, and public URL (the URL is used for canonical links, the RSS feed, and the sitemap). Edit `pages/about.md` for the About page, and `public/style.css` for the design.

## What the build produces

`npm run build` writes `dist/`:

- `index.html` — the post list
- `posts/<slug>/index.html` — one page per post
- `about/index.html` — the About page
- `feed.xml`, `sitemap.xml`, `robots.txt`

Everything in `public/` is copied over as-is, so put images and other assets there.

## Publishing

`dist/` is a plain static site — host it anywhere.

**GitHub Pages:** `.github/workflows/deploy.yml` builds and deploys on every push to the default branch. Enable it once under *Settings → Pages → Source: GitHub Actions*.

**Netlify / Cloudflare Pages / Vercel:** build command `npm run build`, publish directory `dist`.

**Any web server:** copy the contents of `dist/` into the document root.

## Layout

```
posts/      Markdown posts
pages/      Standalone pages (about)
public/     Static assets, copied to dist/ (style.css lives here)
src/        Build script, Markdown renderer, templates, dev server
site.json   Site name, description, author, URL
```

## Markdown support

Headings, paragraphs, bold, italic, links, images, inline and fenced code, ordered and unordered lists, blockquotes, and horizontal rules. The renderer in `src/markdown.js` is about 150 lines — extend it if you need more.
