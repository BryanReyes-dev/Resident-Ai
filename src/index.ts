import { OllamaProvider } from "./providers/ollama-provider.js";

const prompt = process.argv.slice(2).join(" ").trim();

if (!prompt) {
  console.error("Usage: npm start -- \"your prompt\"");
  process.exit(1);
}

const provider = new OllamaProvider();

try {
  const response = await provider.generate(prompt);
  console.log(response);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
