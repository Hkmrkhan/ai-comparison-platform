# 🔄 API Keys Flow Architecture - Your AI Comparison Platform

## 📊 Current Architecture Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    🏠 FRONTEND (Browser)                        │
│                   /compare page (Client)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1️⃣ USER LOADS PAGE                                            │
│     ┌─────────────────────────────────────────┐                │
│     │ useEffect() → loadUserData()            │                │
│     │                                         │                │
│     │ const { data: { user } } =              │                │
│     │   await supabase.auth.getUser()         │                │
│     │                                         │                │
│     │ const { data } = await supabase         │                │
│     │   .from('user_preferences')             │                │
│     │   .select('*')                          │                │
│     │   .eq('user_id', user.id)              │                │
│     │   .single()                             │                │
│     └─────────────────────────────────────────┘                │
│             │                                                   │
│             ▼                                                   │
│  2️⃣ KEYS LOADED FROM DATABASE                                  │
│     ┌─────────────────────────────────────────┐                │
│     │ setApiKeys(data.api_keys || {})         │                │
│     │                                         │                │
│     │ Example DB Storage (JSON):              │                │
│     │ {                                       │                │
│     │   "groq": "gsk_xxx...",                │                │
│     │   "openai": "sk-xxx...",               │                │
│     │   "google": "AIza...",                 │                │
│     │   "anthropic": "sk-ant-xxx..."         │                │
│     │ }                                       │                │
│     └─────────────────────────────────────────┘                │
│             │                                                   │
│             ▼                                                   │
│  3️⃣ USER ENTERS PROMPT & CLICKS COMPARE                        │
│     ┌─────────────────────────────────────────┐                │
│     │ handleCompare() function                │                │
│     │                                         │                │
│     │ // Filter models with API keys          │                │
│     │ const modelsWithKeys =                  │                │
│     │   selectedModels.filter(model =>       │                │
│     │     apiKeys[model.provider])           │                │
│     └─────────────────────────────────────────┘                │
│             │                                                   │
│             ▼                                                   │
│  4️⃣ PARALLEL API CALLS TO BACKEND                              │
│     ┌─────────────────────────────────────────┐                │
│     │ Promise.allSettled(                     │                │
│     │   modelsWithKeys.map(async (model) => { │                │
│     │     const response = await fetch(       │                │
│     │       '/api/chat', {                    │                │
│     │         method: 'POST',                 │                │
│     │         body: JSON.stringify({          │                │
│     │           model: model.name,            │                │
│     │           prompt: prompt,               │                │
│     │           provider: model.provider,     │                │
│     │           apiKey: apiKeys[model.provider] │                │
│     │         })                              │                │
│     │       })                                │                │
│     │   })                                    │                │
│     │ )                                       │                │
│     └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ⚡ BACKEND API ROUTE                           │
│                 /api/chat/route.ts                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  5️⃣ PROCESS EACH REQUEST                                       │
│     ┌─────────────────────────────────────────┐                │
│     │ export async function POST(request) {   │                │
│     │   const { model, prompt, provider,      │                │
│     │           apiKey } = await request.json() │                │
│     │                                         │                │
│     │   // Determine API endpoint             │                │
│     │   if (provider === 'groq') {           │                │
│     │     apiUrl = 'https://api.groq.com...' │                │
│     │     headers['Authorization'] =          │                │
│     │       `Bearer ${apiKey}`               │                │
│     │   }                                     │                │
│     │   // ... similar for other providers   │                │
│     │ }                                       │                │
│     └─────────────────────────────────────────┘                │
│             │                                                   │
│             ▼                                                   │
│  6️⃣ FORWARD TO AI PROVIDERS                                    │
│     ┌─────────────────────────────────────────┐                │
│     │ const response = await fetch(apiUrl, {  │                │
│     │   method: 'POST',                       │                │
│     │   headers: headers,                     │                │
│     │   body: JSON.stringify(requestBody)     │                │
│     │ })                                      │                │
│     └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                🤖 EXTERNAL AI PROVIDERS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  7️⃣ PROCESS BY EACH PROVIDER                                   │
│                                                                 │
│     🚀 GROQ API                 🧠 OPENAI API                   │
│     ┌─────────────────┐        ┌─────────────────┐             │
│     │ Llama 3.3 70B   │        │ GPT-5          │             │
│     │ Llama 3.1 8B    │        │ GPT-4.1        │             │
│     │ Qwen 3 32B      │        └─────────────────┘             │
│     └─────────────────┘                                        │
│                                                                 │
│     🔮 GOOGLE API               🎭 ANTHROPIC API                │
│     ┌─────────────────┐        ┌─────────────────┐             │
│     │ Gemini 2.5 Flash│        │ Claude Opus 4.1 │             │
│     │ Gemini 2.5 Pro  │        │ Claude Sonnet4.5│             │
│     └─────────────────┘        └─────────────────┘             │
│                                                                 │
│  8️⃣ RETURN RESPONSES                                           │
│     Each provider returns JSON with model response             │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ⚡ BACKEND PROCESSING                          │
│                 /api/chat/route.ts                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  9️⃣ PARSE & NORMALIZE RESPONSES                                │
│     ┌─────────────────────────────────────────┐                │
│     │ // Different response parsing           │                │
│     │ if (provider === 'google') {            │                │
│     │   responseText = data.candidates?.[0]?. │                │
│     │     content?.parts?.[0]?.text           │                │
│     │ } else {                                │                │
│     │   responseText = data.choices?.[0]?.    │                │
│     │     message?.content                    │                │
│     │ }                                       │                │
│     │                                         │                │
│     │ return NextResponse.json({              │                │
│     │   response: responseText,               │                │
│     │   usage: data.usage                     │                │
│     │ })                                      │                │
│     └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    🏠 FRONTEND DISPLAY                          │
│                   /compare page (Client)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔟 DISPLAY RESULTS                                            │
│     ┌─────────────────────────────────────────┐                │
│     │ const formattedResponses = results.map( │                │
│     │   (result) => ({                        │                │
│     │     model: model.label,                 │                │
│     │     provider: model.provider,           │                │
│     │     response: data.response,            │                │
│     │     time: Math.round(endTime-startTime),│                │
│     │     wordCount: response.split(/\s+/)    │                │
│     │                      .length,           │                │
│     │     success: !data.error                │                │
│     │   })                                    │                │
│     │ )                                       │                │
│     │                                         │                │
│     │ setResponses(formattedResponses)        │                │
│     └─────────────────────────────────────────┘                │
│             │                                                   │
│             ▼                                                   │
│  1️⃣1️⃣ RENDER RESPONSE CARDS                                    │
│     ┌─────────────────────────────────────────┐                │
│     │ {responses.map((response, idx) => (     │                │
│     │   <div key={idx} className="...">       │                │
│     │     <h3>{response.model}</h3>           │                │
│     │     <p>{response.response}</p>          │                │
│     │     <div>                               │                │
│     │       ⏱️ {response.time}ms              │                │
│     │       📝 {response.wordCount} words     │                │
│     │       ✅/❌ {response.success}          │                │
│     │     </div>                              │                │
│     │   </div>                                │                │
│     │ ))}                                     │                │
│     └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 Security & Data Flow Summary

### 📊 **Database Storage (Supabase)**
```
Table: user_preferences
┌─────────────┬─────────────────────────────────────┐
│ user_id     │ 12345-uuid                         │
│ api_keys    │ {                                   │
│ (JSON)      │   "groq": "gsk_xxxxxxxxxxxx",     │
│             │   "openai": "sk-xxxxxxxxxxxx",    │
│             │   "google": "AIzaxxxxxxxxxxxx",   │
│             │   "anthropic": "sk-ant-xxxxxxx"   │
│             │ }                                   │
└─────────────┴─────────────────────────────────────┘
```

### 🔄 **Key Points in Your Architecture:**

1. **Client-Side Storage**: API keys are stored in Supabase database as JSON, fetched via direct Supabase client calls
2. **No Server-Side Key Storage**: Keys pass through your Next.js API route but aren't stored there
3. **Direct Provider Access**: Your backend forwards requests to external AI providers using user's keys
4. **Parallel Processing**: Multiple AI models are queried simultaneously using `Promise.allSettled()`
5. **Response Normalization**: Different provider response formats are standardized in your backend

### ⚠️ **Current Security Considerations:**
- ✅ **Good**: API keys don't go directly from browser to AI providers
- ✅ **Good**: Using Next.js API routes as proxy
- ⚠️ **Consider**: Keys are in JSON format in database (consider encryption)
- ⚠️ **Consider**: Keys pass through client-side state (could be intercepted)

### 🚀 **Flow Performance:**
- Parallel API calls mean faster overall response time
- Each provider has different response times (Groq fastest, others vary)
- Real-time progress tracking with loading states