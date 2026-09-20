# Resident AI

A local-first, model-agnostic resident AI architecture for building private, persistent, tool-using AI agents on your own machine or Linux server.

## Current status

Resident AI currently has a minimal model-provider contract and an Ollama provider. The first local development brain is Qwen 3.5 9B through Ollama.

The project is intentionally early-stage. Context, persistent memory, environment observation, tools, permissions, agent orchestration, and multi-model coordination are being built incrementally.

## Architecture

The core relationship is:

```text
User / Client
     │
     ▼
Resident AI
     │
     ├── Context
     ├── Memory
     ├── Tools
     ├── Permissions
     └── Model Provider
              │
              ▼
        Model Runtime
              │
              ▼
            Model
```

Resident AI is the orchestration layer. The model and model runtime are replaceable dependencies.

Ollama is the first provider integration, not the definition of Resident AI.

## Requirements

- Node.js
- npm
- Ollama
- A model installed in Ollama

## Development

```bash
npm install
npm run build
npm start -- "Hello"
```

The architecture is provider-agnostic. Resident AI talks to the `ModelProvider` interface rather than directly depending on a model runtime.

## Agent Files

The `agent-files/` directory contains the shared instructions and context used by AI coding agents. It is separate from the human-facing README and application source.

```text
agent-files/
├── AGENTS.md
├── ARCHITECTURE.md
├── Agents_Context.md
└── CLAUDE.md
```

- `AGENTS.md` — agent behavior and repository rules.
- `ARCHITECTURE.md` — finalized architecture decisions.
- `Agents_Context.md` — current working context, discoveries, proposals, and open questions.
- `CLAUDE.md` — Claude entry point that loads the shared agent instructions/context.

The workflow is:

```text
Discovery / idea
      ↓
Agents_Context.md
      ↓
Experiment / implementation
      ↓
Validated result
      ↓
Explicit approval
      ↓
ARCHITECTURE.md
```

## Public and Private Data

The repository contains the reusable architecture, source code, schemas, examples, and documentation.

Machine-specific and personal runtime data remains outside version control:

```text
Private runtime data
├── context/
├── memory/
├── logs/
├── permissions/*.conf
└── .env*
```

Downloaded model weights are also runtime resources and are not committed to Git.

This separation allows another user to clone the repository, choose a supported provider, and supply their own private context and configuration without modifying the core architecture.

## Security Direction

Resident AI is intended to gain capabilities incrementally:

```text
Observation
    ↓
Analysis / recommendations
    ↓
User-approved limited execution
    ↓
Broader controlled execution
```

Unrestricted shell or root access is not part of the current foundation.

## Current Repository Structure

```text
resident-ai/
├── src/
│   ├── core/
│   │   └── model-provider.ts
│   ├── providers/
│   │   └── ollama-provider.ts
│   └── index.ts
├── agent-files/
├── context/          # private runtime data
├── memory/           # private runtime data
├── permissions/      # private configuration; examples may be public
├── logs/             # private runtime data
├── system/
├── tools/
├── config/
├── scripts/
├── package.json
├── tsconfig.json
└── README.md
```

Some directories are intentionally placeholders for capabilities that will be implemented later. Their presence does not mean those capabilities are currently implemented.
