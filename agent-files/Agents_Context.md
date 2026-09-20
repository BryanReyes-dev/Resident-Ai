# Resident AI — Agents Context

> Shared short-term working context for Bryan, ChatGPT, Codex, and other agents working on Resident AI.
>
> This file is non-secret and may be committed to the public repository. It is living working memory, not the authoritative architecture document. Finalized architecture belongs in `agent-files/ARCHITECTURE.md`.

## Current Direction

Resident AI is being built as a reusable local-first resident AI architecture rather than a private one-off server script.

The repository should be cloneable by another user who can select a model provider and supply their own private runtime data.

## Current Foundation

- TypeScript is the core implementation language.
- Node.js provides the current runtime.
- Ollama is the first model provider.
- Qwen 3.5 9B is the current local development model.
- The provider boundary is represented by `ModelProvider`.
- `OllamaProvider` currently implements that interface.
- The command-line entry point currently accepts one prompt and prints one response.
- Personal context, memory, logs, secrets, and machine-specific configuration are intentionally excluded from the public repository.

## Repository Convention

Resident AI uses the shared `agent-files/` convention:

```text
agent-files/
├── AGENTS.md
├── ARCHITECTURE.md
├── Agents_Context.md
└── CLAUDE.md
```

`AGENTS.md` contains agent behavior and repository rules.

`ARCHITECTURE.md` contains finalized architecture.

`Agents_Context.md` contains current discoveries, implementation state, proposals, open questions, and handoffs.

`CLAUDE.md` provides the Claude entry point into the shared agent instructions/context.

## Current Open Questions

- Exact conversation/session model.
- Exact context file format and loading order.
- Persistent memory storage and retrieval design.
- How Resident AI should discover and describe the host environment.
- Tool registration and invocation contract.
- Permission schema and enforcement mechanism.
- Read-only environment observation layer.
- User approval flow for tool execution.
- Multi-model/provider routing.
- Remote client/API architecture.
- How the resident should coordinate specialized AI capabilities such as image, video, and audio tooling.
- How private runtime data should be structured for portability between machines.

## Working Rule

Do not silently turn an open question into a finalized architectural requirement.

Consolidate stale or duplicated material instead of endlessly appending to this file.
