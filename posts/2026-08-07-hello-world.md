---
title: Hello, world
date: 2026-08-07
tags: [meta]
---

This is the first post on Draftbook. It exists mostly to show what a published post looks like — headings, links, lists, quotes, and code all render from plain Markdown.

## Writing a post

Every post is one Markdown file in the `posts/` folder. The file starts with a short front matter block that sets the title, date, and tags:

```markdown
---
title: Hello, world
date: 2026-08-07
tags: [meta]
---
```

Everything after the closing `---` is the body of the post.

## What you get

- A home page listing every published post, newest first
- A page per post at `/posts/<slug>/`
- An RSS feed at `/feed.xml`, plus `sitemap.xml` and `robots.txt`
- Dark mode that follows the reader's system setting

> Keep the tooling small enough that you spend your time writing, not maintaining the blog.

To publish, run `npm run build` and upload the `dist/` folder anywhere that serves static files.
