export interface AIModel {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'google' | 'huggingface'
}

export interface Comparison {
  id: string
  userId: string
  prompt: string
  models: string[]
  createdAt: Date
}