export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider?: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
    description: 'Latest flagship - Best for complex tasks',
    provider: 'groq'
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B',
    description: 'Speed champion - 560 tokens/sec',
    provider: 'groq'
  },
  {
    id: 'qwen/qwen3-32b',
    name: 'Qwen 3 32B',
    description: 'Alibaba Cloud model - 400 tokens/sec',
    provider: 'groq'
  }
];

export function getModelById(id: string): AIModel | undefined {
  return AI_MODELS.find(model => model.id === id);
}

export function getAllModels(): AIModel[] {
  return AI_MODELS;
}