export interface ModelProvider {
  generate(prompt: string): Promise<string>;
}
