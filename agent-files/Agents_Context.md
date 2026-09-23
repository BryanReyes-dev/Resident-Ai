# Resident AI — Agents Context

> Shared short-term working context for Bryan, ChatGPT, Codex, and other agents working on Resident AI.
>
> This file is non-secret and may be committed to the public repository. It is living working memory, not the authoritative architecture document. Finalized architecture belongs in `agent-files/ARCHITECTURE.md`.

## Current Direction

Resident AI is being built as a **Linux-server-first resident AI runtime and orchestration platform** rather than a web application or private one-off server script.

Resident AI should run persistently on an enterprise Linux server and provide a controlled AI service to applications and users on that environment.

The repository should be cloneable by another organization or user who can select model runtimes/providers and supply their own private runtime data.

## Current Foundation

- TypeScript is the core implementation language.
- Node.js provides the current application runtime.
- Ollama is the first model provider.
- Qwen 3.5 9B is the current local development model.
- The provider boundary is represented by `ModelProvider`.
- `OllamaProvider` currently implements that interface.
- The command-line entry point currently accepts one prompt and prints one response.
- Personal context, memory, logs, secrets, and machine-specific configuration are intentionally excluded from the public repository.
- A `web/` starter application exists from earlier experimentation, but it is not part of the intended Resident AI service architecture and should not become the core product boundary.

## Architecture Decisions Now Reflected

### Server role

Resident AI is Linux-server-first.

The target runtime is a persistent Linux service, with the operating system responsible for service supervision during the initial deployment model.

The intended process relationship is:

```text
systemd
 ├── resident-ai.service
 └── inference-runtime.service
```

Resident AI and inference runtimes may eventually have Resident AI-managed lifecycle coordination, but they remain explicit process boundaries.

### External communication

External applications/services should communicate with Resident AI rather than directly with a model runtime.

HTTP(S) is the initial external API transport.

gRPC remains a future option where strongly typed service-to-service communication or other requirements justify it.

### Internal communication

When Resident AI and an inference runtime are colocated on the same Linux host, Unix-domain sockets are the default internal transport.

The transport is not the architectural abstraction itself. Provider/runtime contracts must remain independent of whether communication uses Unix sockets, TCP, or another transport.

Containerized deployments may use Unix sockets when a secure shared socket boundary can be deliberately provided. A network transport is appropriate when services cross hosts or cannot practically share local IPC.

## AI SDK Direction

Vercel AI SDK is being evaluated as the standardized AI interaction layer, not as the authoritative Resident AI runtime-management abstraction.

Current intended layering:

```text
Resident AI orchestration
        ↓
AI SDK integration
        ↓
Resident AI provider/runtime adapter
        ↓
Runtime transport
        ↓
Model runtime
```

AI SDK can provide standardized model interaction, streaming, structured generation, tool interaction, and provider integrations where appropriate.

Resident AI must retain ownership of broader runtime-management concepts such as model discovery, runtime lifecycle, process health, resource policy, permissions, and host orchestration.

AI SDK custom-provider support is a potential path for capabilities/providers that are not covered by an existing AI SDK integration.

## Immediate Implementation Goal

The next implementation milestone is to establish a real persistent Linux-server inference path using **llama.cpp + AI SDK**.

Target flow:

```text
Resident AI
   ↓
AI SDK
   ↓
Resident AI llama.cpp adapter/provider
   ↓
Unix-domain socket
   ↓
llama-server
   ↓
GGUF model
```

The existing Ollama provider should remain intact during this work so the project has more than one concrete runtime path and does not prematurely replace the existing provider abstraction.

### Initial implementation order

1. Install the `ai` package in the Resident AI TypeScript project.
2. Establish a small AI SDK integration without making AI SDK the core Resident AI abstraction.
3. Install/build `llama.cpp` on the Linux server.
4. Run `llama-server` with a suitable GGUF model.
5. Verify the llama.cpp OpenAI-compatible API independently.
6. Implement the Resident AI adapter needed to connect AI SDK to the local llama.cpp service.
7. Validate the end-to-end prompt path.
8. Replace machine-specific connection details with environment/configuration.
9. Run Resident AI as a persistent systemd-managed service.
10. Add health/readiness behavior after the basic persistent path works.

## Current Architecture Questions

These remain open until implementation/validation:

- Exact Resident AI external API shape.
- Whether the external API should support HTTP only initially or also gRPC at the first production milestone.
- Exact internal runtime/provider interface beyond the current `generate(prompt)` contract.
- Best mechanism for connecting AI SDK's HTTP-oriented provider layer to a Unix-domain socket.
- Whether Resident AI should directly implement an AI SDK custom provider or use an OpenAI-compatible adapter.
- Runtime lifecycle ownership between Resident AI and systemd.
- Model discovery and runtime/model registry.
- Model loading/unloading policy.
- CPU/GPU/RAM resource scheduling.
- Multi-model routing.
- Health/readiness semantics.
- Exact conversation/session model.
- Exact context file format and loading order.
- Persistent memory storage and retrieval design.
- Host environment observation layer.
- Tool registration and invocation contract.
- Permission schema and enforcement mechanism.
- Read-only environment observation.
- User approval flow for tool execution.
- Remote client authentication/authorization.
- Specialized AI capability coordination for image, video, and audio.
- Portability of private runtime data between Linux machines.

## Security / Operations Notes

- Resident AI should not expose the inference runtime directly as the enterprise application API.
- Runtime sockets should be treated as privileged internal interfaces and protected by filesystem ownership/permissions.
- Network-facing services should use explicit authentication and authorization before enterprise deployment.
- Downloaded model weights and runtime state remain outside Git.
- Unrestricted shell/root execution is not part of the current foundation.

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

## Working Rule

Do not silently turn an open question into a finalized architectural requirement.

Consolidate stale or duplicated material instead of endlessly appending to this file.
