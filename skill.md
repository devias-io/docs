---
name: devias
description: Build on and operate Devias, an open-source business operating system. Install and write modules, call the HTTP API and TypeScript SDK, configure workflows and agents, and host the server. Use when a task involves Devias records, modules, workflows, agents or its API.
---

# Devias

Devias is an open-source platform that works as an operating system for a business. A core provides records, views, workflows, tasks, documents, agents and permissions. Modules add areas of the business: customers, quotes, invoices, payments, expenses, products, stock and connections to outside services. It runs on the user's own server with Postgres, or with an embedded database to try it. It is young and changes quickly. If these docs and the source repository (github.com/devias-io/devias) disagree, the repository is right.

## What an agent can do with Devias

- **Read and write business data** through the HTTP API or the TypeScript SDK. See [HTTP API](/reference/api/overview) and [TypeScript SDK](/reference/sdk/client).
- **Install, update and uninstall modules** with a plan that is reviewed before it is applied. See [Plan and apply](/guides/modules/plan-and-apply).
- **Write a module**: objects and fields, views, layouts, navigation, actions with server code, connections to outside services, workflows, agents and skills. See [What a module is](/guides/modules/what-a-module-is).
- **Automate work** with workflows that start from a record change, a task change, a schedule, a module event or a manual run. See [Workflows and tasks](/concepts/automation).
- **Define agents** with instructions and a tool list, each tool set to run freely or ask first. See [Define an agent](/guides/agents/define-an-agent).
- **Follow changes** as a server-sent events stream. See [Change feed](/reference/api/change-feed).
- **Host Devias**: deploy the server and the studio, choose the database, set environment variables. See [Deploy](/operate/deploy).

## Inputs and credentials

| Input | Where it comes from |
| --- | --- |
| Server URL | `http://localhost:3000` by default |
| Workspace id | Settings → General in the studio. It is not a uuid. |
| API key | Settings → API keys. A key made there can read records. Plan and apply need a key created through the API with `{ "module": ["manage"] }`. Sent in the `x-api-key` header. |
| AI provider key | `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` or `OPENAI_API_KEY`, with `AI_PROVIDER`. Without one, agents are off and everything else works. |

## Constraints

- Every id in a module (module, object, field, view, action, workflow, step, connection, variable, event, policy) is a uuid made once and never changed. Generate ids with `devias id <count>`. Do not write readable or dotted ids.
- Run `devias plan` and read it before `devias apply`. Deletions need `--allow-destructive`. Apply is tied to the plan that was reviewed.
- A module owns what it declared. A workspace cannot edit or delete those items. It can add its own fields to the module's objects and copy a module's workflow.
- Every request, from a person, key, workflow, module or agent, passes one permission check. An agent acts with the role of the person who asked and cannot exceed it.
- A tool set to Ask first waits for an approval. Do not try to route around it.
- Workflows act as themselves and cannot change workspace settings. A workflow's changes never start workflows. Workflow runs go one at a time in a workspace, so actions must be short and safe to repeat.
- Policies declared by a module are experimental: they are shown, not enforced.

## Common workflows

### Create and install a module

1. Generate ids: `devias id 6`.
2. Write `src/manifest/index.ts` with `defineModule`, listing objects, views and navigation.
3. List the package in `devias.config.ts`.
4. Run `devias plan -w <workspaceId> -m ./src/manifest/index.ts`, read the output, then `devias apply` with the same flags.

See [Create a first module](/guides/modules/first-module).

### Call the HTTP API

1. Take the routes and schemas from the OpenAPI document at `https://docs.devias.io/reference/api/openapi.json`.
2. Send `x-api-key` with each request, under `/api/workspaces/<workspaceId>/`.
3. Handle the error codes in [API errors](/reference/api/errors).

### Ship a workflow from a module

1. Write the work as an action with `defineAction` and `defineActionHandler`. Make it safe to run twice.
2. Throw `RetryableError` for failures that may pass, such as a rate limit.
3. Declare the workflow with `defineWorkflow` and a trigger, and list it in the manifest.

See [Workflows in a module](/guides/modules/workflows).

## More

- [Glossary](/start/glossary) for exact terms.
- [Use these docs with AI](/start/use-with-ai) for `llms.txt`, per-page Markdown and the MCP server.
