# Resident AI Architecture

> This document records finalized architecture decisions. Working ideas and unresolved implementation questions belong in `agent-files/Agents_Context.md` until explicitly finalized.

## 1. System Identity

Resident AI is a **Linux-server-first, model-agnostic AI runtime and orchestration platform** for enterprise and server environments.

Resident AI is not a model or inference runtime. It is the persistent service that coordinates model runtimes, providers, context, memory, tools, permissions, policies, and client applications.

The project is intended to be reusable: another organization or user should be able to deploy Resident AI to a Linux server, configure their own runtime data and providers, and use the same core architecture without inheriting Bryan's private environment.

Resident AI is intentionally server-oriented. Cross-platform desktop packaging is not a requirement of the Resident AI architecture.

## 2. System Boundary

Resident AI is the primary application/service boundary for AI capabilities on the host.

The foundational relationship is:

```text
Enterprise / Client Application
             │
             │ External service protocol
             ▼
      ┌──────────────────┐
      │    Resident AI   │
      │                  │
      │ API / Auth       │
      │ Policy           │
      │ Orchestration    │
      │ Model Management │
      └────────┬─────────┘
               │
               │ Internal IPC
               ▼
      ┌──────────────────┐
      │  Model Runtime   │
      │ llama.cpp / ...  │
      └────────┬─────────┘
               ▼
             Model
```

Enterprise applications should communicate with Resident AI rather than directly depending on a particular local inference runtime.

Resident AI therefore owns the higher-level application-facing contract, security policy, routing, and orchestration. Inference runtimes own model execution.

## 3. Process and Transport Boundaries

Resident AI is designed around explicit process boundaries.

### External communication

Communication between Resident AI and external applications/services uses a network-capable service protocol.

HTTP(S) is the initial default for the external Resident AI API. gRPC remains a valid future option when strongly typed service-to-service communication or streaming requirements justify it.

### Internal communication

When Resident AI and an inference/runtime service are colocated on the same Linux host, **Unix-domain sockets are the default internal transport**.

This is a transport decision, not the model/provider abstraction itself.

```text
External service
      │
   HTTP(S)
      ▼
Resident AI
      │
 Unix socket
      ▼
Inference runtime
```

The internal contract must remain independent of the transport so that a runtime can later be moved to another host, container boundary, or deployment topology without redesigning Resident AI's orchestration layer.

### Deployment topology exception

Containerized services may use Unix-domain sockets when the socket can be safely and deliberately shared between the participating services.

When a runtime resides on another host or cannot practically share the local IPC boundary, a network transport is used instead.

## 4. Runtime Separation

Inference runtimes are independent services/processes rather than part of Resident AI's application logic.

The intended relationship is:

```text
Resident AI Core
      │
      ▼
Runtime / Provider abstraction
      │
      ├── Unix socket transport
      │
      ▼
Runtime service
      │
      ├── llama.cpp
      ├── Ollama
      ├── vLLM
      └── other supported runtimes
```

The runtime owns model loading and inference execution.

Resident AI may eventually manage runtime lifecycle, health, resource policy, and model selection, but this does not require Resident AI to embed or tightly couple itself to a particular runtime implementation.

For initial server deployment, operating-system service management such as systemd may supervise the Resident AI and inference-runtime processes independently.

## 5. Model Provider Abstraction

Resident AI communicates with models through a provider/runtime abstraction.

The abstraction must remain independent of a specific model runtime, protocol, or vendor SDK.

The current provider path is:

```text
Resident AI Core
      ↓
ModelProvider
      ↓
OllamaProvider
      ↓
Ollama
      ↓
Qwen 3.5 9B
```

Ollama is the first implementation, not a permanent architectural dependency.

Future local or hosted providers/runtimes should be addable without requiring core orchestration code to understand provider-specific protocols.

## 6. AI SDK Integration

The Vercel AI SDK is an **AI interaction/integration layer**, not the authoritative Resident AI runtime abstraction.

Resident AI may use AI SDK Core to standardize language-model interaction, streaming, tool interaction, structured generation, and provider integrations.

The architectural relationship is:

```text
Resident AI orchestration
        │
        ▼
AI SDK integration
        │
        ▼
Resident AI provider/runtime adapter
        │
        ▼
Runtime transport
        │
        ▼
Model runtime
```

AI SDK must not become the definition of Resident AI's runtime-management layer.

Resident AI's own interfaces remain responsible for concepts that are broader than model interaction, including runtime lifecycle, model discovery, resource policy, process health, permissions, and host-level orchestration.

AI SDK custom-provider support may be used when Resident AI needs an integration that is not available through an existing provider.

## 7. Current Implementation

The current repository is an early TypeScript implementation.

```text
src/
├── core/
│   └── model-provider.ts
├── providers/
│   └── ollama-provider.ts
└── index.ts
```

The current executable path accepts a command-line prompt, sends it through the provider abstraction to Ollama, and prints the model response.

This is a foundation, not the complete resident architecture.

The next implementation milestone is to establish the Linux server runtime path using llama.cpp and AI SDK without removing the existing provider abstraction.

## 8. Runtime Data Separation

Public source code and private runtime data are intentionally separated.

```text
Public repository
├── src/
├── system/
├── tools/
├── config/
├── permissions/
├── scripts/
├── docs/
└── agent-files/

Private runtime data
├── context/
├── memory/
├── logs/
├── permissions/*.conf
└── .env*
```

Private runtime data must not become a dependency of the public repository.

Model weights and downloaded runtime artifacts must not be committed to Git.

## 9. Context and Memory

Context and persistent memory are separate concepts.

Context provides information needed to understand the user's identity, environment, projects, preferences, and current operating state.

Memory is persistent information accumulated by the resident over time.

Both are user-owned runtime data and must remain inspectable, editable, and removable.

The exact storage, retrieval, ranking, summarization, and consolidation mechanisms are not yet finalized.

## 10. Tools and Permissions

Tools are capabilities that Resident AI may eventually use to interact with the host system and external services.

Permissions are an independent control layer over those capabilities.

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

Unrestricted shell/root execution is not part of the current foundation.

## 11. Provider and Model Separation

A model and its runtime are external resources rather than repository source.

For example:

```text
Resident AI repository
       │
       └── provider/runtime integration

Linux server
       │
       ├── Resident AI service
       ├── inference runtime
       └── model weights
```

Model weights and machine-specific runtime state must remain outside version control.

## 12. Server Lifecycle

Resident AI is intended to operate as a persistent Linux service rather than as a one-shot CLI process.

The initial production-oriented process model is:

```text
systemd
 ├── resident-ai.service
 └── inference-runtime.service
```

Resident AI should eventually expose health/readiness information and recover cleanly from runtime failures.

Resident AI may later coordinate runtime lifecycle, but operating-system supervision remains a valid and supported deployment mechanism.

## 13. Development Progression

Resident AI should be developed incrementally.

The current progression is:

```text
Model connection
      ↓
Provider abstraction
      ↓
llama.cpp runtime integration
      ↓
AI SDK integration
      ↓
Persistent Resident AI service
      ↓
External service API
      ↓
Conversation
      ↓
Context
      ↓
Persistent memory
      ↓
Read-only environment observation
      ↓
Tools
      ↓
Permission-controlled execution
      ↓
Agent orchestration
      ↓
Multi-model / multi-tool coordination
      ↓
Runtime/model management
```

Each layer should be validated before becoming a major dependency of the next layer.

## 14. Architecture Change Rule

Architectural changes require explicit approval from Bryan before being recorded as finalized decisions here.

The workflow is:

```text
Idea / discovery
      ↓
Agents_Context.md
      ↓
Experiment / implementation
      ↓
Validated result
      ↓
Bryan approves
      ↓
ARCHITECTURE.md
```

This keeps proposed capabilities separate from the architecture that has actually been finalized.
