# Resident AI

A local-first, model-agnostic AI runtime and orchestration service for private, persistent AI agents.

## Current state

- `cli/` contains the initial Rust CLI scaffold. Clap provides the initial help and version interface.
- The CLI is not connected to a running service yet. Status, chat, and other service commands are future work.
- The persistent Resident AI server is described in the architecture documents, but its implementation is not currently tracked in this repository.
- There is no web dashboard. Next.js and Vite+ are intentionally not part of the current project.

Keep implemented code, validated experiments, and planned architecture distinct. The Linux inference experiment described in `agent-files/Agents_Context.md` was validated outside the repository implementation.

## Architecture

The intended service boundary is:

```text
User / Client / Rust CLI
          │
        HTTP(S)
          ▼
   Resident AI Service
   ├── API and access control
   ├── Orchestration and policy
   ├── Model registry and runtime management
   ├── Context and memory
   └── Tools and permissions
          │
   AI SDK Core / provider adapter
          │
   Runtime transport
          ▼
   Inference runtime
   (llama.cpp, Ollama, etc.)
          │
          ▼
        Model
```

Resident AI owns the application-facing contract, orchestration, policy, and runtime management. Inference runtimes own model loading and inference. The Rust CLI is intended to be a thin client/management interface; it should not duplicate service or model orchestration logic.

HTTP(S) is the planned external service transport. A Unix-domain socket is the default internal transport for a colocated Linux inference runtime. The transport and model-provider boundaries should remain replaceable.

## Repository layout

```text
Resident-Ai/
├── cli/
│   ├── Cargo.toml
│   └── src/
│       └── main.rs
├── agent-files/
│   ├── AGENTS.md
│   ├── ARCHITECTURE.md
│   ├── Agents_Context.md
│   └── CLAUDE.md
├── .gitignore
└── README.md
```

Only create a `server/` directory when server source is ready to be added. Avoid placeholder applications, duplicate tooling, and empty scaffolding.

## CLI development

Requirements: a Rust toolchain with Cargo.

From the repository root:

```bash
cd cli
cargo run -- --help
cargo run -- --version
cargo test
cargo build --release
```

The CLI is a foundation, not a functional service client yet. Its first future capabilities are to query service health and send chat requests through the agreed Resident AI API.

## Agent files

The `agent-files/` directory separates shared AI-coding-agent context from the human-facing README:

- `AGENTS.md` — repository rules and agent behavior.
- `ARCHITECTURE.md` — finalized architectural decisions.
- `Agents_Context.md` — current status, discoveries, implementation plan, and open questions.
- `CLAUDE.md` — Claude entry point for the shared instructions.

The workflow is:

```text
Idea / discovery
      ↓
Agents_Context.md
      ↓
Experiment / implementation
      ↓
Validation
      ↓
Explicit approval
      ↓
ARCHITECTURE.md
```

## Public and private data

Private, machine-specific runtime data must remain outside version control:

```text
context/
memory/
logs/
permissions/*.conf
.env*
model weights and runtime artifacts
```

Users should be able to clone the repository and supply their own configuration and private data without changing the reusable application architecture.

## Security direction

Capabilities should be introduced incrementally:

```text
Observation
    ↓
Analysis and recommendations
    ↓
User-approved limited execution
    ↓
Broader controlled execution
```

Unrestricted shell or root execution is not part of the foundation.
