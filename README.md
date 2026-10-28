# Devias documentation

The documentation is written for AI agents first. People read it too, but every page must work for a reader that has no browser and sees only Markdown.

## Rules

- **No tutorials, no marketing.** State what a thing is, its exact values, limits and defaults, and what to do. No personas, no "who it is for", no cards.
- **Short titles, long descriptions.** A `title` is at most 34 characters. Use `sidebarTitle` for a shorter label in the navigation. The `description` is what `llms.txt` shows (Mintlify cuts it at 300 characters): one unique, self-contained summary with the key facts first. Quote it when it contains `: `.
- **Pages stand alone.** The first paragraph defines the subject without "this page". A heading names its subject. Nothing says "above" or "as shown".
- **Exact over friendly.** Identifiers in code font. Values, statuses, limits and error codes in tables. Samples are complete, and every id in a sample is a uuid (`devias id`).
- **Pages are typed by folder.** `concepts/` explains, `guides/` gives procedures (each step with its expected result), `reference/` is exhaustive, `operate/` covers hosting, `start/` orients.
- **Few images.** Only the screenshots on the allow-list in `scripts/check.mjs` stay, each with a descriptive alt text and the same information in text. Adding one means adding it to the allow-list.
- **A final "Related" list** links to what continues the topic. Do not use "Next steps" or cards.
- **Verify against the code.** UI labels, schema fields, routes, defaults and limits come from the repository, not from memory.

## Check

```bash
node scripts/check.mjs      # the rules above
npx mint validate           # the build
npx mint broken-links       # internal links
rm -rf src                  # mint leaves this folder behind
```

`reference/api/openapi.json` is a copy of `apps/server/openapi.with-modules.json` from the Devias repository. After the API changes, run `pnpm --filter @devias/server-app openapi:export` there and copy that file here.

## For AI agents

`/llms.txt`, `/llms-full.txt`, `<page>.md`, `/mcp` and `/skill.md` are served by the docs site. `docs.json` sets the agent instructions (`markdown.instructions`), and `skill.md` is hand-written.
