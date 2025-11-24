import { GroqService } from './groq-service';

export interface ModelResponse {
  model: string;
  response: string;
  responseTime: number;
  wordCount: number;
  success: boolean;
  error: string | null;
}

export class AIService {
  private groqService: GroqService;

  constructor() {
    this.groqService = new GroqService();
  }

  async generateResponse(model: string, prompt: string): Promise<string> {
    try {
      console.log('🚀 AIService: Generating response for model:', model);
      const result = await this.groqService.makeRequest(model, prompt);
      console.log('✅ AIService: Response generated successfully');
      return result;
    } catch (error) {
      console.error('💥 AIService Error:', error);
      // Return a user-friendly error message instead of throwing
      return `Sorry, ${model} is currently unavailable. Please try again. (${error instanceof Error ? error.message : 'Unknown error'})`;
    }
  }

  async compareModels(models: string[], prompt: string): Promise<ModelResponse[]> {
    console.log('🔄 AIService: Starting model comparison for', models.length, 'models');
    
    const results = await Promise.allSettled(
      models.map(async (model) => {
        const startTime = Date.now();
        try {
          const response = await this.generateResponse(model, prompt);
          const endTime = Date.now();
          const wordCount = response.split(/\s+/).length;
          
          return {
            model,
            response,
            responseTime: endTime - startTime,
            wordCount,
            success: !response.includes('currently unavailable'),
            error: null
          };
        } catch (error) {
          const endTime = Date.now();
          return {
            model,
            response: `Sorry, ${model} is currently unavailable. Please try again.`,
            responseTime: endTime - startTime,
            wordCount: 8,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          model: models[index],
          response: `Sorry, ${models[index]} is currently unavailable. Please try again.`,
          responseTime: 0,
          wordCount: 8,
          success: false,
          error: result.reason?.message || 'Unknown error'
        };
      }
    });
  }
}