# Resident AI Architecture

> This document records finalized architectural decisions. Working ideas, discoveries, and unresolved implementation questions belong in `agent-files/Agents_Context.md`.

## 1. System identity

Resident AI is a **Linux-server-first, model-agnostic AI runtime and orchestration service** for private, persistent, tool-using AI agents.

Resident AI is not a model or inference runtime. The service is intended to coordinate model interaction, providers, context, memory, tools, permissions, policy, host/runtime management, and client applications.

The repository is designed to be reusable by other users and organizations. Personal context, secrets, runtime state, downloaded models, and machine-specific configuration remain outside version control.

## 2. System boundary

The intended relationship is:

```text
External application / Rust CLI
             │
           HTTP(S)
             │
             ▼
      Resident AI Service
      ├── API and access control
      ├── Policy and orchestration
      ├── Model registry
      ├── Runtime management
      ├── Context and memory
      └── Tools and permissions
             │
       AI SDK Core / adapter
             │
        Runtime transport
             ▼
       Inference runtime
             │
             ▼
           Model
```

External applications should depend on the Resident AI service contract rather than a particular model provider or inference runtime. The Rust CLI is intended to be a thin client/management tool, not an independent model orchestration engine.

## 3. Linux deployment boundary

Linux is the target for the Resident AI server architecture. This permits Linux-native service management, filesystem permissions, Unix-domain sockets, process supervision, and host inspection without requiring equivalent abstractions for Windows or macOS.

Where practical, keep Linux-specific implementation details below application contracts so they do not unnecessarily affect model interaction and orchestration logic.

## 4. Process and transport boundaries

- HTTP(S) is the initial intended transport between external applications and the Resident AI service.
- Unix-domain sockets are the default internal transport when Resident AI and an inference runtime are colocated on a Linux host.
- gRPC may be considered later if service-to-service requirements justify it.
- Transport is not the model/provider abstraction. Keep the internal runtime contract independent of transport so deployments can later span hosts or containers.

A network transport is appropriate when services cross hosts or cannot share a local socket boundary securely.

## 5. Runtime separation

Inference runtimes are independent services/processes rather than embedded Resident AI application logic. Supported integrations may include llama.cpp, Ollama, vLLM, SGLang, OpenAI-compatible endpoints, hosted APIs, and other systems.

The runtime owns model loading and inference execution. Resident AI may manage runtime lifecycle, health, resource policy, model selection, and provisioning without tightly coupling orchestration to one runtime implementation. Linux service managers such as systemd may supervise Resident AI and inference runtimes independently.

## 6. Model-interaction engine

Vercel AI SDK Core is the intended model-interaction engine for the service implementation. Resident AI should reuse its generation, streaming, structured-output, tool-interaction, and provider capabilities rather than reimplementing those features.

Prefer an existing AI SDK provider when it supports the required runtime/provider. Use an OpenAI-compatible adapter for compatible APIs when appropriate, and a custom AI SDK provider only when existing options are insufficient.

AI SDK is not responsible for Resident AI's model registry, runtime discovery/lifecycle, host capability discovery, process supervision, resource policy, external service API, permissions, deployment, or provisioning.

The current architecture direction keeps the CLI in Rust and the service model-interaction layer compatible with AI SDK Core. This does not require duplicating server orchestration in Rust.

## 7. Application and CLI distribution

The Rust CLI lives in `cli/` and builds through Cargo. It is a separate client/management boundary.

The long-term service distribution goal is a self-contained application boundary that does not require an administrator to separately install the service's JavaScript runtime or dependency tree. The precise packaging mechanism is not finalized. Model weights, native inference runtimes, the Linux kernel, and hardware drivers remain independently managed resources.

Do not add a web dashboard or frontend build toolchain unless a concrete product requirement calls for one. Next.js and Vite+ are not part of the current architecture.

## 8. Provider and runtime abstraction

The service must retain a model/runtime abstraction that is independent of a particular vendor SDK or inference runtime. Its contract should reflect the actual model registry and AI SDK usage rather than a narrow prompt-to-string function.

When a desired runtime/provider is not directly supported, use an existing compatible adapter or create a custom integration as appropriate. A provider is an implementation, not the definition of Resident AI.

## 9. Current implementation status

The repository currently contains an initial Rust CLI scaffold. It supports the CLI framework's help/version interface and is not yet connected to a running Resident AI service.

The persistent service and AI SDK/llama.cpp integration are not currently implemented in tracked source. A Linux development environment previously validated an AI SDK request through a Unix-domain socket to llama.cpp, but that experiment is not the same as a committed service implementation.

Implementation status must be based on tracked source and repeatable validation, not diagrams or external experiments.

## 10. Runtime data separation

Public source code and private runtime data are separate.

Public source may contain application code, architecture, schemas, examples, deployment scripts, and agent documentation. Private context, persistent memory, logs, local configuration/secrets, machine-specific permissions, model weights, and downloaded runtime artifacts must stay outside Git.

Both context and memory are user-owned runtime data that should remain inspectable, editable, and removable. Their exact storage and retrieval mechanisms are not finalized.

## 11. Tools and permissions

Tools are capabilities Resident AI may use to interact with the host and external services. Permissions form an independent control layer over those capabilities.

The intended progression is:

```text
Observation
    ↓
Analysis / recommendations
    ↓
User-approved limited execution
    ↓
Broader controlled execution
```

Unrestricted shell/root execution is not part of the foundation. Tool capabilities and permissions must be explicit, auditable, and enforced outside model-generated instructions.

## 12. Host capability discovery and provisioning

Resident AI is intended to discover hardware/software capabilities and use a structured capability profile to plan supported runtime/model provisioning. This subsystem is not implemented yet.

Discovery should deterministically inspect items such as Linux distribution/version, CPU capabilities, RAM/storage, GPU/VRAM, acceleration backends, installed runtimes/models, and service-manager availability. Do not give an unconstrained model authority to execute arbitrary host-discovery or installation commands.

## 13. Server lifecycle

Resident AI is intended to operate as a persistent Linux service, rather than a one-shot CLI process. The initial production-oriented process model uses separate service supervision for Resident AI and its inference runtime.

The service should eventually provide defined health/readiness semantics and recover cleanly from runtime failures. These capabilities are not implemented in the current repository.

## 14. Source-to-server deployment

The eventual deployment workflow should synchronize a selected Git commit or release artifact to the Linux server, install locked dependencies where applicable, build and validate, restart the service, and verify readiness.

The target deployment checkout should be clean and represent the selected commit/artifact exactly. A dirty server working tree must not be silently merged with incoming code. Development deployment and released self-contained distribution are separate concerns.

## 15. Architecture change rule

Finalized architecture belongs here. New proposals and unresolved questions belong in `agent-files/Agents_Context.md`.

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
Bryan approves
      ↓
ARCHITECTURE.md
```

Do not silently turn an open question into a finalized architectural requirement.
