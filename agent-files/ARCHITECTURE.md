# Resident AI Architecture

> This document records finalized architecture decisions. Working ideas and unresolved implementation questions belong in agent-files/Agents_Context.md until explicitly finalized.

## 1. System Identity

Resident AI is a **Linux-server-first, model-agnostic AI runtime and orchestration platform** for enterprise and server environments.

Resident AI is not a model or inference runtime. It is the persistent service that coordinates AI model interaction, model runtimes, providers, context, memory, tools, permissions, policies, and client applications.

The project is intended to be reusable: another organization or user should be able to deploy Resident AI to a Linux server and use the same application architecture without inheriting Bryan's private environment.

Resident AI is intentionally server-oriented. Cross-platform desktop packaging is not a requirement of the Resident AI architecture.

## 2. System Boundary

Resident AI is the primary application/service boundary for AI capabilities on the host.

The foundational relationship is:

    Enterprise / Client Application
                 │
               HTTP(S)
                 │
                 ▼
          ┌──────────────────┐
          │    Resident AI   │
          │                  │
          │ API / Auth       │
          │ Policy           │
          │ Orchestration    │
          │ Model Registry   │
          │ Runtime Manager  │
          └────────┬─────────┘
                   │
             Unix-domain socket
                   │
                   ▼
          ┌──────────────────┐
          │ Inference Runtime│
          │ llama.cpp / ...   │
          └────────┬─────────┘
                   ▼
                 Model

Enterprise applications should communicate with Resident AI rather than directly depending on a particular local inference runtime.

Resident AI owns the higher-level application-facing contract, security policy, model selection, runtime orchestration, and host/service management. Inference runtimes own model loading and inference execution.

## 3. Linux Deployment Boundary

Resident AI is Linux-server-first.

Linux is the supported target platform for the Resident AI server architecture. This intentionally permits use of Linux-native service management, filesystem permissions, Unix-domain sockets, process supervision, and other host facilities without requiring equivalent abstractions for Windows or macOS.

Linux-specific implementation choices must remain below Resident AI's application contracts where practical so that a future platform decision does not unnecessarily infect model-interaction or orchestration logic.

## 4. Process and Transport Boundaries

Resident AI is designed around explicit process boundaries.

### External communication

Communication between Resident AI and external applications/services uses a network-capable service protocol.

HTTP(S) is the initial default for the external Resident AI API. gRPC remains a future option when strongly typed service-to-service communication or other requirements justify it.

### Internal communication

When Resident AI and an inference/runtime service are colocated on the same Linux host, **Unix-domain sockets are the default internal transport**.

This is a transport decision, not the model/provider abstraction itself.

    External service
          │
       HTTP(S)
          ▼
    Resident AI
          │
     Unix socket
          ▼
    Inference runtime

The internal contract must remain independent of the transport so that a runtime can later be moved to another host, container boundary, or deployment topology without redesigning Resident AI's orchestration layer.

Containerized deployments may use Unix sockets when a secure shared socket boundary can be deliberately provided. A network transport is appropriate when services cross hosts or cannot practically share local IPC.

## 5. Runtime Separation

Inference runtimes are independent services/processes rather than part of Resident AI's application logic.

The intended relationship is:

    Resident AI
          │
          ▼
    Runtime / Model abstraction
          │
          ├── llama.cpp
          ├── Ollama
          ├── vLLM
          └── other supported runtimes
                   │
                   ▼
              Model execution

The runtime owns model loading and inference execution.

Resident AI may eventually manage runtime lifecycle, health, resource policy, and model selection, but this does not require Resident AI to embed or tightly couple itself to a particular runtime implementation.

For initial server deployment, operating-system service management such as systemd may supervise Resident AI and inference-runtime processes independently.

## 6. AI SDK Core as the Model-Interaction Engine

Vercel AI SDK Core is a deliberate Resident AI dependency for **model interaction**.

Resident AI should rely on AI SDK rather than reimplement model-interaction infrastructure that AI SDK already provides, including standardized generation APIs, streaming, structured generation, tool interaction, and provider integration where supported.

The relationship is:

    Resident AI orchestration
            │
            ▼
        AI SDK Core
            │
            ▼
    AI SDK Provider / Resident AI Adapter
            │
            ▼
      Runtime transport
            │
            ▼
        Model runtime

AI SDK is therefore a major dependency of the AI interaction layer, but it is not the owner of Resident AI's infrastructure architecture.

Resident AI remains responsible for concepts outside model interaction, including:

- Model registry and model identity.
- Runtime discovery and lifecycle.
- Host capability discovery.
- Process supervision and health.
- Resource policies.
- Permissions and authorization.
- External service API.
- Configuration and deployment.
- Runtime/model provisioning.

When AI SDK already provides a provider for a desired model/service, Resident AI should prefer using that provider rather than reimplementing the provider protocol.

When a desired runtime/provider is not directly covered, Resident AI may use an OpenAI-compatible adapter, a community provider, or a custom AI SDK provider as appropriate.

AI SDK custom-provider support is an integration mechanism, not a replacement for Resident AI's own runtime-management layer.

## 7. Self-Contained Application Distribution

The Resident AI application is intended to be distributed as a self-contained executable boundary.

An installation should not require an administrator to separately install Node.js, npm, or Resident AI's JavaScript dependency tree.

    Resident AI distribution
    ├── Resident AI application
    ├── application runtime
    └── bundled application dependencies

External infrastructure remains separately provisioned:

    Linux host
    ├── Resident AI executable
    ├── inference runtime(s)
    ├── model weights
    ├── OS / kernel
    └── hardware drivers

Resident AI owns the installation/provisioning workflow for supported external infrastructure, but model weights and native runtimes remain independently manageable resources.

The exact executable packaging technology is intentionally not part of this finalized architecture.

## 8. Model Provider / Runtime Abstraction

Resident AI must retain a model/runtime abstraction independent of a specific vendor SDK or inference runtime.

The abstraction should represent Resident AI's needs while allowing AI SDK Core to handle model interaction underneath it.

The architectural relationship is:

    Resident AI Model Registry
              │
              ▼
       AI SDK LanguageModel
              │
              ├── AI SDK provider
              ├── OpenAI-compatible adapter
              └── Custom AI SDK provider
                        │
                        ▼
                  Runtime transport
                        │
                        ▼
                    Model runtime

The current Ollama provider remains the first concrete repository implementation.

Ollama is an implementation, not the definition of Resident AI.

## 9. Current Implementation

The current repository is an early TypeScript implementation.

The current main-branch executable path is:

    CLI prompt
       ↓
    ModelProvider
       ↓
    OllamaProvider
       ↓
    Ollama
       ↓
    Model

This is a foundation, not the complete resident architecture.

The Linux llama.cpp + AI SDK path has been validated in the development server environment and is now the next implementation path, but the current main-branch source does not yet represent the completed persistent service architecture.

## 10. Runtime Data Separation

Public source code and private runtime data are intentionally separated.

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

Private runtime data must not become a dependency of the public repository.

Model weights and downloaded runtime artifacts must not be committed to Git.

## 11. Context and Memory

Context and persistent memory are separate concepts.

Context provides information needed to understand the user's identity, environment, projects, preferences, and current operating state.

Memory is persistent information accumulated by the resident over time.

Both are user-owned runtime data and must remain inspectable, editable, and removable.

The exact storage, retrieval, ranking, summarization, and consolidation mechanisms are not yet finalized.

## 12. Tools and Permissions

Tools are capabilities that Resident AI may eventually use to interact with the host system and external services.

Permissions are an independent control layer over those capabilities.

The intended progression is:

    Observation
        ↓
    Analysis / recommendations
        ↓
    User-approved limited execution
        ↓
    Broader controlled execution

Unrestricted shell/root execution is not part of the current foundation.

## 13. Host Capability Discovery and Provisioning

Resident AI is intended to discover the host's hardware and software capabilities and use the resulting profile to plan supported runtime/model provisioning.

This is an architectural capability, but the scanner and provisioning system are not yet implemented.

The intended relationship is:

    Host Capability Discovery
              ↓
       Capability Profile
              ↓
       Provisioning Planner
              ↓
       Runtime / Model setup
              ↓
          Resident AI

Host discovery must be deterministic system inspection rather than unrestricted model-generated shell execution.

## 14. Server Lifecycle

Resident AI is intended to operate as a persistent Linux service rather than as a one-shot CLI process.

The initial production-oriented process model is:

    systemd
     ├── resident-ai.service
     └── inference-runtime.service

Resident AI should eventually expose health/readiness information and recover cleanly from runtime failures.

Resident AI may later coordinate runtime lifecycle, but operating-system supervision remains a valid supported deployment mechanism.

## 15. Source-to-Server Deployment

The development workflow should keep the source repository and installed runtime as separate concerns.

The intended development deployment loop is:

    Developer workstation
            │
            │ git push
            ▼
         GitHub main
            │
            │ deploy
            ▼
    Linux development server
            │
            ├── fetch main
            ├── install locked dependencies
            ├── build
            ├── validate
            └── restart service

A release workflow may instead deploy a packaged Resident AI executable rather than building from source on the target machine.

The deployment system must not require a dirty server working tree; the target deployment checkout should represent the selected Git commit or release artifact exactly.

## 16. Architecture Change Rule

Architectural changes require explicit approval from Bryan before being recorded as finalized decisions here.

The workflow is:

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

This keeps proposed capabilities separate from the architecture that has actually been finalized.
