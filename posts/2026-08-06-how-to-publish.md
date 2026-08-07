---
title: How publishing works
date: 2026-08-06
tags: [guide]
---

Publishing is two steps: write a Markdown file, then build the site.

## 1. Start a post

```bash
npm run new -- "The post I want to write"
```

That creates a dated file in `posts/` with front matter already filled in. New posts start with `draft: true`, so they are skipped by the build until you remove that line.

## 2. Preview it

```bash
npm run dev
```

The dev server rebuilds on every request, so save the file and reload the browser.

## 3. Publish

```bash
npm run build
```

The finished site lands in `dist/`. Upload that folder to GitHub Pages, Netlify, Cloudflare Pages, or any static host — there is no server to run and nothing to install.

## Front matter reference

- `title` — the post title. Required in practice; falls back to the filename.
- `date` — `YYYY-MM-DD`. Controls ordering on the home page.
- `tags` — a list, like `[guide, notes]`.
- `slug` — optional; overrides the URL derived from the title.
- `excerpt` — optional; overrides the auto-generated summary.
- `draft` — set to `true` to keep a post out of the build.
