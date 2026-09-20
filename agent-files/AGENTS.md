# Resident AI Agent Instructions

Resident AI is a local-first, model-agnostic architecture for building private, persistent, tool-using AI agents. The repository contains the reusable architecture and code; machine-specific context, memory, secrets, logs, and configuration remain outside version control.

## Before Working

1. Read `agent-files/Agents_Context.md` for current working context.
2. Read `agent-files/ARCHITECTURE.md` for finalized architecture.
3. Inspect the current implementation before making assumptions.
4. Treat planned capabilities as plans unless the source confirms they are implemented.
5. Keep provider/runtime boundaries explicit.

## Architecture Boundaries

- Resident AI is the orchestration/application layer, not the model itself.
- A model runtime/provider such as Ollama executes the model; Resident AI communicates through a provider abstraction.
- Provider-specific behavior belongs in provider implementations rather than being spread through core logic.
- Personal context and memory are runtime data, not public source code.
- Tools and permissions must have explicit boundaries; do not introduce unrestricted execution merely because a local agent could technically use it.

## Provider Independence

The first provider is Ollama, but Ollama must remain an implementation of the provider boundary rather than the definition of Resident AI.

Future providers may include other local runtimes or OpenAI-compatible APIs without requiring the core architecture to be rewritten.

## Documentation Authority

- `agent-files/ARCHITECTURE.md` is authoritative for finalized architecture.
- `agent-files/Agents_Context.md` is short-term working context, discoveries, hypotheses, proposals, and handoffs.
- Do not silently promote working context into finalized architecture.
- Architectural changes require Bryan's explicit approval before being recorded as finalized decisions.

## Public vs Private Data

Do not commit:

- Personal context
- Persistent personal memory
- Runtime logs
- Secrets
- Machine-specific permissions/configuration
- Downloaded model weights

Public examples and schemas may be committed when they contain no private data.
