# Resident AI Architecture

> This document records finalized architecture decisions. Working ideas and unresolved implementation questions belong in `agent-files/Agents_Context.md` until explicitly finalized.

## 1. System Identity

Resident AI is a local-first, model-agnostic architecture for building a persistent AI resident on a user's own machine or server.

Resident AI is not a model. It is the orchestration layer around models, providers, context, memory, tools, permissions, and user interaction.

The project is intended to be reusable: another user should be able to clone the repository, choose a supported model provider, configure their own runtime data, and use the same core architecture without inheriting Bryan's private environment.

## 2. Core Runtime Boundary

The foundational execution relationship is:

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

Resident AI owns orchestration and policy. The model runtime owns model execution.

## 3. Model Provider Abstraction

Resident AI communicates with models through a provider interface.

The current interface is intentionally small:

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

The provider boundary should allow future local or hosted providers without requiring core orchestration code to understand provider-specific protocols.

## 4. Current Implementation

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

## 5. Runtime Data Separation

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

## 6. Context and Memory

Context and persistent memory are separate concepts.

Context provides information needed to understand the user's identity, environment, projects, preferences, and current operating state.

Memory is persistent information accumulated by the resident over time.

Both are user-owned runtime data and must remain inspectable, editable, and removable.

The exact storage, retrieval, ranking, summarization, and consolidation mechanisms are not yet finalized.

## 7. Tools and Permissions

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

## 8. Provider and Model Separation

A model and its runtime are external resources rather than repository source.

For example:

```text
Resident AI repository
       │
       └── Ollama provider integration

Ollama installation
       │
       └── Qwen 3.5 9B model weights
```

Model weights must not be committed to Git.

## 9. Reusable Architecture

The repository is designed to be reusable by other users.

A user's machine-specific implementation should be supplied through configuration and runtime data rather than by forking the architecture around one machine.

The public repository should therefore contain examples, schemas, and defaults rather than personal credentials, private context, or hardware-specific assumptions.

## 10. Development Principle

Resident AI should be developed incrementally.

The current progression is:

```text
Model connection
      ↓
Provider abstraction
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
```

Each layer should be validated before becoming a major dependency of the next layer.

## 11. Architecture Change Rule

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
