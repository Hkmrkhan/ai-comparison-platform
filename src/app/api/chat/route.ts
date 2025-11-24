import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🎯 API ROUTE CALLED');
  
  try {
    // Log raw request
    const requestBody = await request.text();
    console.log('📥 Raw request body:', requestBody);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }, { status: 400 });
    }

    const { model, prompt } = parsedBody;
    console.log('📦 Parsed data:', { 
      model: model, 
      prompt: prompt ? `${prompt.substring(0, 100)}...` : 'undefined',
      modelType: typeof model,
      promptType: typeof prompt
    });

    // Enhanced validation
    if (!model) {
      console.error('❌ Missing model');
      return NextResponse.json({ 
        success: false, 
        error: 'Model is required' 
      }, { status: 400 });
    }

    if (!prompt) {
      console.error('❌ Missing prompt');
      return NextResponse.json({ 
        success: false, 
        error: 'Prompt is required' 
      }, { status: 400 });
    }

    if (typeof model !== 'string') {
      console.error('❌ Invalid model type:', typeof model);
      return NextResponse.json({ 
        success: false, 
        error: 'Model must be a string' 
      }, { status: 400 });
    }

    if (typeof prompt !== 'string') {
      console.error('❌ Invalid prompt type:', typeof prompt);
      return NextResponse.json({ 
        success: false, 
        error: 'Prompt must be a string' 
      }, { status: 400 });
    }

    // Check API key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('❌ GROQ_API_KEY is not configured');
      return NextResponse.json({ 
        success: false, 
        error: 'GROQ_API_KEY not configured' 
      }, { status: 500 });
    }

    console.log('🚀 Calling Groq API with model:', model);
    
    // Prepare request payload
    const groqPayload = {
      model: model,
      messages: [{ 
        role: 'user', 
        content: prompt 
      }],
      max_tokens: 1024,
      temperature: 0.7,
    };

    console.log('📤 Groq API payload:', JSON.stringify(groqPayload, null, 2));
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groqPayload),
    });

    console.log('📡 Groq Response Status:', response.status);
    console.log('📡 Groq Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API Error Response:', errorText);
      
      // Try to parse error as JSON
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
        console.error('❌ Groq API Error Details:', errorDetails);
      } catch {
        console.error('❌ Groq API Raw Error:', errorText);
      }
      
      return NextResponse.json({ 
        success: false, 
        error: `Groq API error: ${response.status} - ${errorText}` 
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ Groq API Success - Full Response:', JSON.stringify(data, null, 2));
    
    // Validate response structure
    const messageContent = data?.choices?.[0]?.message?.content;
    if (!messageContent) {
      console.error('❌ Invalid response structure from Groq API:', data);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid response structure from Groq API' 
      }, { status: 500 });
    }

    console.log('✅ Returning successful response');
    return NextResponse.json({ 
      success: true, 
      response: messageContent 
    });
    
  } catch (error) {
    console.error('💥 API Route Error:', error);
    console.error('💥 Error Stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}