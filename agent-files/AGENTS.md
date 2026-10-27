# Resident AI Agent Instructions

Resident AI is a Linux-server-first, model-agnostic AI runtime and orchestration platform. The repository contains reusable source and architecture; machine-specific context, memory, secrets, logs, and configuration remain outside version control.

## Before working

1. Read `agent-files/Agents_Context.md` for the current state and immediate plan.
2. Read `agent-files/ARCHITECTURE.md` for finalized architectural decisions.
3. Inspect the tracked source before assuming a capability exists.
4. Distinguish committed implementation, validated external experiments, and planned architecture.
5. Keep model interaction, providers, runtimes, transport, infrastructure, and the CLI boundary explicit.

## Repository shape

- `cli/` is the Rust command-line application.
- `agent-files/` contains shared agent instructions and architecture context.
- There is currently no tracked server implementation or web application.
- Do not add Next.js, Vite+, a dashboard, or placeholder `server/` scaffolding without a concrete need.
- Introduce a `server/` directory when actual service source is ready to be committed.
- Use Cargo for Rust builds, dependency management, formatting, and tests.
- Do not retain root Node.js scripts or dependencies unless an actual tracked TypeScript service needs them.

## Architecture boundaries

- Resident AI is the orchestration and service layer, not the model itself.
- Resident AI is Linux-server-first.
- External applications should communicate with the Resident AI service, not directly with an inference runtime.
- HTTP(S) is the initial intended external service transport.
- Unix-domain sockets are the default intended internal transport for colocated inference runtimes on Linux.
- Transport is an implementation detail beneath the provider/runtime boundary.
- Inference runtimes such as llama.cpp, Ollama, and vLLM remain independent services/processes.
- The Rust CLI is a client/management boundary. Keep server-side orchestration and model policy out of the CLI.

## Model interaction

- Vercel AI SDK Core is the intended model-interaction engine for the service implementation.
- Prefer existing AI SDK providers when they support the target runtime/provider.
- Use an OpenAI-compatible provider for compatible runtimes where appropriate.
- Use a custom AI SDK provider only when existing providers/adapters are insufficient.
- Keep AI SDK-specific details out of unrelated infrastructure subsystems.
- AI SDK does not own host discovery, runtime installation, process supervision, permissions, deployment, or other infrastructure concerns.

## Distribution and deployment

- The long-term service goal is a self-contained application boundary; exact packaging technology remains open.
- The CLI should build as a Rust binary through Cargo.
- Large external resources such as model weights and native inference runtimes remain independently managed.
- Deployment should use a clean target checkout or selected release artifact.
- Do not silently merge local server changes with incoming application code.
- Do not claim deployment or service health unless it has actually been checked.

## Host discovery and permissions

- Host capability discovery should use deterministic system inspection.
- Do not give a model unrestricted authority to invent and execute arbitrary installation or discovery commands.
- Runtime provisioning should use explicit, reviewable operations.
- Host discovery, automatic provisioning, memory, tool execution, and multi-model routing must not be assumed implemented.

## Public vs private data

Do not commit personal context, persistent personal memory, runtime logs, secrets, machine-specific permissions/configuration, model weights, or machine-specific runtime state. Public examples and schemas may be committed when they contain no private data.

## Documentation authority

- `agent-files/ARCHITECTURE.md` is authoritative for finalized architecture.
- `agent-files/Agents_Context.md` contains current status, discoveries, proposals, implementation steps, and open questions.
- Do not silently promote working context into finalized architecture.
- Architectural changes require Bryan's explicit approval before being recorded as finalized decisions.

## Immediate development milestone

Establish a small, buildable Rust CLI foundation. The initial executable should support generated help/version output. Define the service health and chat contracts before implementing commands that claim to query service status or send model requests. Do not expand scope into autonomous tools, host provisioning, memory, or multi-model routing as part of this milestone.
