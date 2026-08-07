#!/usr/bin/env node
// Creates posts/<date>-<slug>.md with front matter filled in.
// Usage: npm run new -- "My post title"

const fs = require('fs');
const path = require('path');

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('Usage: npm run new -- "My post title"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
const date = new Date().toISOString().slice(0, 10);
const file = path.join(__dirname, '..', 'posts', `${date}-${slug}.md`);

if (fs.existsSync(file)) {
  console.error(`Already exists: ${file}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(
  file,
  `---
title: ${title}
date: ${date}
tags: [notes]
draft: true
---

Write your post here.
`
);

console.log(`Created ${path.relative(process.cwd(), file)}`);
