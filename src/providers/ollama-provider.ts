import { ModelProvider } from "../core/model-provider.js";

export class OllamaProvider implements ModelProvider {
  constructor(
    private readonly model = "qwen3.5:9b",
    private readonly baseUrl = "http://127.0.0.1:11434",
  ) {}

  async generate(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { response?: string };

    if (typeof data.response !== "string") {
      throw new Error("Ollama returned an invalid response.");
    }

    return data.response;
  }
}
