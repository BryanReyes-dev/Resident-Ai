# Resident AI — Agents Context

> Current working status for Bryan and AI coding agents. This document is working memory, not the authoritative architecture document.

## Current direction

Resident AI is a Linux-server-first, model-agnostic AI runtime and orchestration service. Bryan is learning Rust and will use it to build a CLI for the service.

The repository intentionally stays minimal:
- `cli/` — Rust CLI.
- `agent-files/` — shared instructions and architecture context.
- Root README and `.gitignore`.
- No Next.js starter and no Vite+ toolchain.
- No `server/` directory until the service source is ready to be committed.

The CLI should remain a thin client/management surface. It should not duplicate service-side model interaction, policy, or orchestration.

## Tracked implementation status

- The Rust CLI is an initial scaffold using Clap for argument parsing and generated help/version output.
- The CLI does not yet communicate with a Resident AI service.
- `status`, `chat`, authentication, configuration, and service connection handling are not implemented.
- No persistent Resident AI service implementation is currently tracked in this repository.
- The former root TypeScript one-shot CLI/provider files have been removed. Do not reintroduce root Node scripts without actual tracked TypeScript service code.
- The unused default Next.js app has been removed. A web dashboard is not currently in scope.

## Validated Linux runtime experiment

The Linux development environment previously validated the following path outside the tracked service implementation:

```text
AI SDK Core
    ↓
OpenAI-compatible provider
    ↓
custom fetch
    ↓
Node / Undici
    ↓
Unix-domain socket
    ↓
llama-server
    ↓
Qwen3-4B GGUF
```

Recorded environment facts from that experiment:
- Ubuntu 26.04.1 LTS, x86_64.
- AMD Ryzen 7 5825U, 8 cores / 16 threads, 12 GiB RAM.
- Node.js 24.21.0 and npm 11.19.0.
- llama.cpp prebuilt runtime b10964; llama-server 0.4.1-dev.
- Qwen/Qwen3-4B-GGUF:Q4_K_M loaded and generated successfully.
- Node reached llama-server through a Unix-domain socket and AI SDK generated a response through that transport.

This validates a transport/model-interaction experiment only. It does not mean the persistent service, health endpoint, chat API, deployment scripts, or security model are implemented in this repository.

## Model interaction and service boundary

Vercel AI SDK Core remains the intended model-interaction engine for the service. Use existing AI SDK providers when practical and an OpenAI-compatible adapter for compatible runtimes when appropriate.

The intended service boundary:
- HTTP(S) for external client/CLI requests.
- Unix-domain socket by default for a colocated Linux inference runtime.
- Inference runtimes remain separate processes/services.
- Resident AI owns the application API, model/runtime selection, orchestration, policies, permissions, and host/runtime management.

The exact API schema, health/readiness semantics, authentication, and connection configuration remain open until implemented and validated.

## Immediate implementation plan

1. Build and inspect the Rust CLI scaffold; keep the crate small and use Cargo.
2. Agree the service's health and chat API contracts before making commands claim they work.
3. Implement the persistent service/API in its own directory when source is ready to be committed.
4. Connect the CLI to that contract using HTTP(S) and explicit configuration.
5. Validate service requests against the Linux llama.cpp/Unix-socket path.
6. Add systemd units and deployment automation only after the tracked service can build and run repeatably.
7. Revisit self-contained packaging after the service and CLI boundaries are stable.

Do not add host hardware scanning, automatic runtime/model provisioning, persistent memory, autonomous tool execution, multi-model orchestration, enterprise authentication, or a web UI as part of the initial CLI foundation.

## Open questions

- Exact HTTP API routes and schemas.
- Health/readiness behavior and error semantics.
- CLI connection configuration, default endpoint, and authentication.
- Which process owns runtime lifecycle versus systemd.
- How the service will bundle its JavaScript runtime/dependencies.
- Model registry and runtime configuration format.
- Context and persistent memory storage/retrieval.
- Tool registration and permission enforcement.
- Host capability profile schema and provisioning policy.
- Release signing, update verification, and rollback strategy.

## Security and data rules

- Keep private context, memory, secrets, logs, machine-specific permissions/configuration, model weights, and downloaded artifacts out of Git.
- Protect runtime sockets with deliberate filesystem ownership and permissions.
- Do not expose inference runtimes directly as the external application API.
- Do not implement unrestricted shell/root execution.
- Host discovery and provisioning must use explicit, reviewable operations.

## Working rule

Do not treat a plan, architecture diagram, or experiment outside the repository as a committed implementation. Keep this file current as work progresses; only move finalized, explicitly approved decisions into `agent-files/ARCHITECTURE.md`.
