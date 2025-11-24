export class GroqService {
  private readonly apiEndpoint = '/api/chat';

  async makeRequest(model: string, prompt: string): Promise<string> {
    try {
      console.log('🔥 GroqService: Starting request');
      console.log('📤 Request params:', { 
        model, 
        promptLength: prompt?.length,
        modelType: typeof model,
        promptType: typeof prompt 
      });

      // Validate inputs before sending
      if (!model || typeof model !== 'string') {
        throw new Error('Invalid model parameter');
      }
      
      if (!prompt || typeof prompt !== 'string') {
        throw new Error('Invalid prompt parameter');
      }
      
      const requestBody = {
        model: model.trim(),
        prompt: prompt.trim(),
      };

      console.log('📤 Sending request to:', this.apiEndpoint);
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        throw new Error(`API route error: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('📡 Raw response length:', responseText.length);

      let data: { success: boolean; response?: string; error?: string };
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse response JSON:', parseError);
        throw new Error('Invalid JSON response from API');
      }

      console.log('📦 Parsed response success:', data.success);
      
      if (!data.success) {
        console.error('❌ API returned error:', data.error);
        throw new Error(data.error || 'API request failed');
      }

      if (!data.response) {
        throw new Error('No response content received');
      }

      console.log('✅ Request successful');
      return data.response;
    } catch (error) {
      console.error('💥 GroqService Error:', error);
      throw error;
    }
  }
}