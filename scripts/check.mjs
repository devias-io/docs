// Checks that the docs keep the rules of AI-first documentation. Usage: node scripts/check.mjs
// Fails (exit 1) on: a card, a step block or a screenshot that is not on the allow-list; a missing, long (> 300
// characters, where llms.txt truncates), repeated or unquoted-colon description; a long title; a generic heading;
// a page that does not open with a plain paragraph.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** The few screenshots that stay, each with a full text equivalent beside it. */
const SCREENSHOTS = new Set([
  'studio-assistant.webp',
  'studio-approval.webp',
  'studio-home.webp',
  'records-table.webp',
  'workflows-editor.webp',
]);
const GENERIC_HEADINGS = /^(next steps|where to go next|start here|overview|introduction|getting started)$/i;
const MAX_DESCRIPTION = 300;
const MAX_TITLE = 34;

const pages = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === 'node_modules' || name.startsWith('.') || name === 'src') return [];
    return statSync(path).isDirectory() ? pages(path) : path.endsWith('.mdx') ? [path] : [];
  });

const problems = [];
const seen = new Map();
const known = new Set(pages('.').map((file) => `/${file.replace(/\.mdx$/, '')}`));

for (const file of pages('.')) {
  const source = readFileSync(file, 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const report = (message) => problems.push(`${file}: ${message}`);

  if (!match) {
    report('no frontmatter');
    continue;
  }

  const [, meta, body] = match;
  const title = meta.match(/^title: (.*)$/m)?.[1]?.trim();
  const raw = meta.match(/^description: (.*)$/m)?.[1]?.trim();
  const description = raw?.replace(/^(["'])([\s\S]*)\1$/, '$2');

  if (!title) report('no title');
  else if (title.length > MAX_TITLE) report(`title is ${title.length} characters (max ${MAX_TITLE}): ${title}`);

  if (!description) report('no description');
  else {
    if (description.length > MAX_DESCRIPTION) report(`description is ${description.length} characters (max ${MAX_DESCRIPTION})`);
    if (/: /.test(raw) && !/^["']/.test(raw)) report('description has ": " and is not quoted');
    if (seen.has(description)) report(`description repeats ${seen.get(description)}`);
    seen.set(description, file);
  }

  for (const tag of ['<Card', '<CardGroup', '<Steps', '<Step ']) {
    if (body.includes(tag)) report(`uses ${tag}: write a plain list instead`);
  }

  for (const image of body.matchAll(/<img src="\/images\/([^"]+)"([^>]*)>/g)) {
    if (!SCREENSHOTS.has(image[1])) report(`screenshot ${image[1]} is not on the allow-list`);
    if (!/alt="[^"]{20,}"/.test(image[2])) report(`screenshot ${image[1]} needs a descriptive alt text`);
  }

  for (const heading of body.matchAll(/^#{2,3} (.*)$/gm)) {
    if (GENERIC_HEADINGS.test(heading[1].trim())) report(`generic heading "${heading[1]}": name the subject`);
  }

  const first = body.trim().split('\n')[0] ?? '';
  if (/^(<|#|\||-|```)/.test(first) && !first.startsWith('<Frame')) report('does not open with a plain summary paragraph');
}

// Links in docs.json (footer, navbar) that point into the docs must point at a page.
const config = JSON.parse(readFileSync('docs.json', 'utf8'));
const hrefs = [
  ...(config.footer?.links ?? []).flatMap((group) => group.items.map((item) => item.href)),
  ...(config.navbar?.links ?? []).map((link) => link.href),
];
for (const href of hrefs.filter((href) => href?.startsWith('/'))) {
  if (!known.has(href === '/' ? '/index' : href)) problems.push(`docs.json: link ${href} does not match a page`);
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  console.error(`\n${problems.length} problem(s)`);
  process.exit(1);
}

console.log(`ok: ${seen.size} pages follow the AI-first rules`);
