# Resident AI — Agents Context

> Shared short-term working context for Bryan, ChatGPT, Codex, and other agents working on Resident AI.
>
> This file is non-secret and may be committed to the public repository. It is living working memory, not the authoritative architecture document. Finalized architecture belongs in agent-files/ARCHITECTURE.md.

## Current Direction

Resident AI is being built as a **Linux-server-first resident AI runtime and orchestration platform** rather than a web application or private one-off server script.

Resident AI should run persistently on an enterprise Linux server and provide a controlled AI service to applications and users on that environment.

The long-term distribution goal is a self-contained Resident AI application executable. Users should not need to manually install Node.js, npm, or the Resident AI JavaScript dependency tree. External infrastructure such as inference runtimes and model weights can be provisioned separately by Resident AI.

The repository should be cloneable by another organization or user who can select model runtimes/providers and supply their own private runtime data.

## Current Foundation

- TypeScript is the current implementation language.
- Node.js is the current development/runtime environment.
- Ollama is the first repository model provider.
- Qwen 3.5 9B is the current Ollama development model.
- The current main-branch provider boundary is represented by ModelProvider.
- OllamaProvider currently implements that interface.
- The current main-branch executable is still a one-shot CLI that accepts one prompt and prints one response.
- Personal context, memory, logs, secrets, and machine-specific configuration are intentionally excluded from the public repository.
- A web/ starter application exists from earlier experimentation and is not the intended Resident AI service boundary.

## Validated Linux Runtime Experiment

The current Linux development server has already validated the following path outside the main-branch Resident AI implementation:

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
    Qwen3-4B Q4_K_M

Validated environment facts:

- Ubuntu 26.04.1 LTS
- x86_64
- AMD Ryzen 7 5825U, 8 cores / 16 threads
- 12 GiB RAM
- No discrete GPU was detected during the initial host check
- Node.js 24.21.0
- npm 11.19.0
- llama.cpp prebuilt runtime b10964
- llama-server version 0.4.1-dev, build 10964
- Qwen/Qwen3-4B-GGUF:Q4_K_M loads and generates successfully
- llama-server successfully binds to a Unix-domain socket
- Node successfully reached the llama-server socket
- AI SDK successfully generated a response through the Unix-socket transport

The experiment established that AI SDK can remain the model-interaction engine while Resident AI controls the server/runtime boundary.

## AI SDK Direction

Vercel AI SDK Core is a deliberate dependency for the Resident AI model-interaction engine.

Resident AI should rely on AI SDK functionality instead of reimplementing model-interaction infrastructure already provided by the SDK.

Use an existing AI SDK provider whenever it covers the requested model/provider.

Use the OpenAI-compatible provider when the runtime exposes a compatible API.

Use a custom AI SDK provider only when an existing provider or compatible adapter is insufficient.

Resident AI retains ownership of infrastructure concepts outside model interaction, including model registry, runtime lifecycle, host discovery, process supervision, resource policy, permissions, authentication/authorization, deployment, and provisioning.

## Server and Transport Direction

Resident AI is Linux-server-first.

External application communication should use a network-capable service protocol. HTTP(S) is the first external API transport; gRPC remains a possible later protocol.

When Resident AI and an inference runtime are colocated on the same Linux host, Unix-domain sockets are the default internal transport.

The transport must remain replaceable beneath the provider/runtime abstraction so that remote or containerized runtimes can use another transport when necessary.

Inference runtimes should remain explicit processes/services rather than being embedded into the Resident AI application by default.

## Self-Contained Distribution Direction

The intended user-facing installation boundary is:

    Linux server
        ↓
    Resident AI installer/executable
        ↓
    host inspection
        ↓
    supported runtime provisioning
        ↓
    model registration/provisioning
        ↓
    service installation
        ↓
    persistent Resident AI

The exact executable packaging implementation is still open. Node.js Single Executable Applications are one candidate implementation, but the architecture does not require Node SEA specifically.

The self-contained boundary means Resident AI should own its application runtime and JavaScript dependencies. It does not mean model weights, GPU drivers, the Linux kernel, or every native inference runtime must be embedded inside the Resident AI executable.

## Immediate Implementation State

The next source implementation should turn the validated experiment into repository code.

Target flow:

    Resident AI service
        ↓
    AI SDK Core
        ↓
    OpenAI-compatible llama.cpp integration
        ↓
    Unix-domain socket
        ↓
    llama-server
        ↓
    GGUF model

The existing Ollama provider should remain until the new path is implemented and validated.

The current ModelProvider interface is likely too narrow for the long-term AI SDK-based architecture because it only exposes a single prompt-to-string generation operation. Do not expand or replace it blindly; first define the boundary based on the actual Resident AI model registry and AI SDK usage.

## 10-Day Minimum Milestone

The minimum target for the next ten days is a **Resident AI 0.2.0 Linux Server Preview** that provides a stable development baseline.

Required acceptance criteria:

1. Resident AI has a persistent Node application process rather than a one-shot prompt process.
2. The service exposes a basic local health endpoint.
3. The service exposes a basic chat endpoint backed by AI SDK Core.
4. AI SDK reaches llama.cpp through the Unix-domain socket.
5. llama.cpp runs as its own systemd-managed service.
6. Resident AI runs as its own systemd-managed service.
7. Model/runtime/socket configuration is externalized rather than hardcoded to one machine path.
8. The repository contains a repeatable deployment command that:
   - synchronizes the Ubuntu deployment checkout to the selected Git commit on main,
   - installs locked dependencies,
   - builds the application,
   - validates the build,
   - restarts the service,
   - checks service health.
9. A versioned 0.2.0 release/tag can be created after the deployment loop is proven.
10. The server can be updated by pushing code to GitHub, pulling the selected version, and restarting the persistent service without manually recreating the runtime setup.

The milestone intentionally does **not** require:

- Host hardware scanning.
- Automatic runtime selection.
- Automatic model provisioning.
- Persistent memory.
- Tool execution.
- Agent orchestration.
- Multi-model routing.
- Enterprise authentication/authorization.
- Public internet exposure.
- Full rollback infrastructure.
- A production enterprise security certification.
- A self-contained executable release.

A self-contained Linux executable is a useful stretch goal for the ten-day period, but it should not prevent the 0.2.0 server-preview milestone if packaging becomes the schedule risk.

## Recommended Implementation Order

    Persistent Resident AI HTTP service
             ↓
    AI SDK Core integration in repository
             ↓
    llama.cpp provider/adapter
             ↓
    Externalized configuration
             ↓
    systemd service for llama.cpp
             ↓
    systemd service for Resident AI
             ↓
    deployment script
             ↓
    health/readiness checks
             ↓
    0.2.0 release baseline
             ↓
    self-contained executable
             ↓
    host capability discovery
             ↓
    runtime/model provisioning

## Deployment Workflow Goal

Development workflow:

    Developer workstation
          ↓
      git push main
          ↓
        GitHub
          ↓
      Ubuntu server
          ↓
    deployment command
          ↓
    fetch selected main commit
          ↓
    npm ci / build
          ↓
    service restart
          ↓
    readiness check

Release workflow can later use packaged artifacts so the target machine does not need Node.js or npm.

The deployment process should treat the server checkout as a deployment artifact, not as a development workspace. A dirty checkout should be rejected rather than silently merged with incoming deployment code.

## Host Capability Discovery

Host discovery is intentionally postponed until the persistent service and deployment baseline are stable.

The eventual subsystem should deterministically inspect:

- Linux distribution/version.
- CPU and instruction capabilities.
- RAM and storage.
- GPU and VRAM where available.
- Supported acceleration backends.
- Installed runtimes.
- Installed models.
- Service manager availability.
- Relevant system capabilities.

The scanner should produce a structured capability profile that a provisioning planner can use. It should not ask an unconstrained model to execute arbitrary discovery shell commands.

## Open Questions

- Exact Resident AI external API shape.
- Whether the first external API remains HTTP-only or also exposes gRPC.
- Long-term Resident AI model/runtime interface.
- Whether the AI SDK provider object itself should be the main model-registry object or wrapped by a Resident AI model record.
- Exact Unix-socket transport abstraction.
- Whether Resident AI should use an OpenAI-compatible provider, a custom AI SDK provider, or both for llama.cpp.
- Runtime lifecycle ownership between Resident AI and systemd.
- Model registry format.
- Model loading/unloading policy.
- CPU/GPU/RAM resource scheduling.
- Multi-model routing.
- Health/readiness semantics.
- Authentication and authorization.
- Conversation/session model.
- Context format/loading order.
- Persistent memory architecture.
- Tool registration and invocation contract.
- Permission schema/enforcement.
- Specialized AI capabilities such as image, video, audio, reranking, embeddings, and transcription.
- Portable runtime-state layout.
- Self-contained executable packaging mechanism.
- Release signing and update verification.
- Rollback strategy.

## Security / Operations Notes

- Resident AI should not expose the inference runtime directly as the enterprise application API.
- Runtime sockets should be protected by filesystem ownership/permissions.
- Network-facing services require explicit authentication and authorization before enterprise deployment.
- Downloaded model weights and runtime state remain outside Git.
- Unrestricted shell/root execution is not part of the current foundation.

## Repository Convention

Resident AI uses the shared agent-files/ convention:

    agent-files/
    ├── AGENTS.md
    ├── ARCHITECTURE.md
    ├── Agents_Context.md
    └── CLAUDE.md

AGENTS.md contains agent behavior and repository rules.

ARCHITECTURE.md contains finalized architecture.

Agents_Context.md contains current discoveries, implementation state, proposals, open questions, and handoffs.

CLAUDE.md provides the Claude entry point into the shared agent instructions/context.

## Working Rule

Do not silently turn an open question into a finalized architectural requirement.

Consolidate stale or duplicated material instead of endlessly appending to this file.
