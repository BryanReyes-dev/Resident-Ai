# Resident AI

A local-first, model-agnostic resident AI architecture for building private, persistent, tool-using AI agents on your own Linux server.

## Current status

Resident AI currently has a minimal model-provider contract and an Ollama provider. The first local brain is Qwen 3.5 9B through Ollama.

## Requirements

- Node.js
- npm
- Ollama
- A model installed in Ollama

## Development

```bash
npm install
npm run build
npm start -- "Hello"
```

The architecture is intentionally provider-agnostic. Resident AI talks to the `ModelProvider` interface rather than directly depending on a model runtime.

Personal context, memory, logs, secrets, and machine-specific configuration are kept outside version control.
