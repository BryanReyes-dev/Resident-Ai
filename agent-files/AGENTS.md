# Resident AI Agent Instructions

Resident AI is a Linux-server-first, model-agnostic AI runtime and orchestration platform. The repository contains the reusable architecture and code; machine-specific context, memory, secrets, logs, and configuration remain outside version control.

## Before Working

1. Read agent-files/Agents_Context.md for current working context.
2. Read agent-files/ARCHITECTURE.md for finalized architecture.
3. Inspect the current implementation before making assumptions.
4. Treat planned capabilities as plans unless the source confirms they are implemented.
5. Keep model-interaction, provider, runtime, transport, and infrastructure boundaries explicit.
6. Do not treat the current development deployment as proof that an architecture is implemented in the repository.

## Architecture Boundaries

- Resident AI is the orchestration and service layer, not the model itself.
- Resident AI is Linux-server-first.
- External applications communicate with Resident AI rather than directly with an inference runtime.
- HTTP(S) is the initial external service transport.
- Unix-domain sockets are the default internal transport for colocated inference runtimes on Linux.
- Transport is an implementation detail beneath the provider/runtime boundary.
- Inference runtimes such as llama.cpp, Ollama, and vLLM are independent services/processes.
- Resident AI may eventually manage runtime lifecycle, but runtime execution remains a distinct boundary.

## AI SDK Core

- Vercel AI SDK Core is an intentional dependency for Resident AI's model-interaction engine.
- Use AI SDK capabilities rather than reimplementing standardized model interaction already provided by the SDK.
- Prefer an existing AI SDK provider when it covers a required model/provider.
- Use the OpenAI-compatible provider for compatible runtimes/services when appropriate.
- Use a custom AI SDK provider only when an existing provider or compatible adapter is insufficient.
- Do not spread AI SDK-specific implementation details throughout unrelated infrastructure subsystems.
- Do not make AI SDK responsible for host discovery, runtime installation, process supervision, model lifecycle, permissions, deployment, or other infrastructure concerns.

## Self-Contained Distribution

- Resident AI is intended to be distributed as a self-contained application executable.
- End users should not need to separately install Node.js, npm, or the Resident AI JavaScript dependency tree.
- The exact packaging technology is not fixed by the architecture.
- Large external resources such as model weights and native inference runtimes remain independently managed.
- Do not commit model weights or machine-specific runtime artifacts.

## Provider and Runtime Independence

The first provider is Ollama, but Ollama must remain an implementation of the provider/runtime boundary rather than the definition of Resident AI.

Future providers and runtimes may include llama.cpp, vLLM, SGLang, hosted APIs, OpenAI-compatible services, and other supported systems without requiring the core orchestration layer to understand each runtime's native protocol.

## Deployment

- GitHub main is the source of truth for a deployment checkout.
- Deployment should operate on a clean target checkout or a selected packaged release artifact.
- Do not silently merge local server modifications with incoming application code.
- A deployment flow should install locked dependencies, build/validate, restart the correct service, and verify readiness.
- Development deployment and released self-contained distribution are separate concerns.

## Host Provisioning

- Host capability discovery should be deterministic system inspection.
- Do not give a model unrestricted authority to invent and execute arbitrary installation or discovery commands.
- Runtime provisioning should use explicit, reviewable operations.
- Host discovery and automatic provisioning are later capabilities and should not be assumed implemented.

## Public vs Private Data

Do not commit:

- Personal context
- Persistent personal memory
- Runtime logs
- Secrets
- Machine-specific permissions/configuration
- Downloaded model weights
- Machine-specific runtime state

Public examples and schemas may be committed when they contain no private data.

## Documentation Authority

- agent-files/ARCHITECTURE.md is authoritative for finalized architecture.
- agent-files/Agents_Context.md is short-term working context, discoveries, hypotheses, proposals, implementation status, and open questions.
- Do not silently promote working context into finalized architecture.
- Architectural changes require Bryan's explicit approval before being recorded as finalized decisions.

## Current Development Rule

The current ten-day target is a 0.2.0 Linux Server Preview. Do not expand this milestone by silently adding memory, autonomous tools, host provisioning, multi-model routing, or enterprise security features that have not been explicitly brought into scope.

