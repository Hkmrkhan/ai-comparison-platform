import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { model, prompt, provider, apiKey } = await request.json();

    if (!model || !prompt || !provider || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let apiUrl = '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Determine API endpoint based on provider
    if (provider === 'groq') {
      apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (provider === 'openai') {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (provider === 'google') {
      // Google Gemini API
      apiUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
      // No authorization header needed, key is in URL
      delete headers['Authorization'];
    } else if (provider === 'anthropic') {
      apiUrl = 'https://api.anthropic.com/v1/messages';
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      return NextResponse.json(
        { error: 'Unsupported provider' },
        { status: 400 }
      );
    }

    let requestBody: any;
    
    // Different request format for Google Gemini
    if (provider === 'google') {
      requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      };
    } else {
      requestBody = {
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      };
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'API request failed' },
        { status: response.status }
      );
    }

    let responseText = '';
    
    // Different response parsing for Google Gemini
    if (provider === 'google') {
      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    } else {
      responseText = data.choices?.[0]?.message?.content || data.content?.[0]?.text || 'No response';
    }

    return NextResponse.json({
      response: responseText,
      usage: data.usage || data.usageMetadata
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}