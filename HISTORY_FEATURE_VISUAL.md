# 📜 Prompt History Feature - Visual Flow

## 🎯 User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    👤 USER STARTS SESSION                       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  📄 /compare Page Loads                                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ useEffect() triggers:                                     │  │
│  │ 1. Load user data                                         │  │
│  │ 2. Load selected models                                   │  │
│  │ 3. Load API keys                                          │  │
│  │ 4. 🆕 Load prompt history (last 20 items)                │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  🎮 User Actions Available                                      │
│  ┌─────────────┬─────────────────┬──────────────────────────┐   │
│  │ Add Models  │ Manage API Keys │ 📜 History (5) ← NEW!   │   │
│  └─────────────┴─────────────────┴──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌─────────────────┐                  ┌─────────────────────────┐
│  NEW PROMPT     │                  │  LOAD FROM HISTORY      │
│  FLOW           │                  │  FLOW                   │
└─────────────────┘                  └─────────────────────────┘
        │                                       │
        │                                       │
        ▼                                       ▼
┌─────────────────────────────────┐   ┌─────────────────────────────┐
│  1. User enters prompt          │   │  1. User clicks 📜 History   │
│  2. Clicks "Compare Models"     │   │  2. Modal opens              │
│  3. AI models process           │   │  3. Shows list of prompts    │
│  4. Responses displayed         │   │  4. User clicks 📂 Load      │
│  5. 🆕 Auto-save to database   │   │  5. Prompt & responses load  │
│     - prompt text               │   │     instantly (no API calls) │
│     - all responses (JSONB)     │   │  6. Modal closes             │
│     - timestamp                 │   └─────────────────────────────┘
│  6. History count updates       │
└─────────────────────────────────┘
```

## 🗄️ Database Structure

```
┌────────────────────────────────────────────────────────────────────┐
│                      SUPABASE DATABASE                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Table: prompt_history                                       │  │
│  │  ┌────────────┬──────────────────────────────────────────┐   │  │
│  │  │ Column     │ Type         │ Description               │   │  │
│  │  ├────────────┼──────────────┼───────────────────────────┤   │  │
│  │  │ id         │ UUID         │ Primary key               │   │  │
│  │  │ user_id    │ UUID         │ FK to auth.users          │   │  │
│  │  │ prompt     │ TEXT         │ User's question           │   │  │
│  │  │ responses  │ JSONB        │ Array of model responses  │   │  │
│  │  │ created_at │ TIMESTAMP    │ When saved                │   │  │
│  │  │ updated_at │ TIMESTAMP    │ Last modified             │   │  │
│  │  └────────────┴──────────────┴───────────────────────────┘   │  │
│  │                                                              │  │
│  │  🔐 RLS Policies:                                            │  │
│  │  ✅ SELECT: WHERE auth.uid() = user_id                      │  │
│  │  ✅ INSERT: WHERE auth.uid() = user_id                      │  │
│  │  ✅ UPDATE: WHERE auth.uid() = user_id                      │  │
│  │  ✅ DELETE: WHERE auth.uid() = user_id                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

## 📱 UI Components

```
┌─────────────────────────────────────────────────────────────────┐
│  📜 History Modal                                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  📜 Prompt History (5)                              ❌     │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ "What is machine learning?"                         │  │  │
│  │  │ Nov 28, 2025, 10:30 AM • 3 models                   │  │  │
│  │  │                                                     │  │  │
│  │  │ Llama 3.3 (234ms)  GPT-5 (456ms)  Claude (389ms)   │  │  │
│  │  │                                                     │  │  │
│  │  │                            [📂 Load]  [🗑️]         │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ "Explain quantum computing in simple terms"         │  │  │
│  │  │ Nov 27, 2025, 3:15 PM • 4 models                    │  │  │
│  │  │                                                     │  │  │
│  │  │ Llama (156ms)  GPT-5 (523ms)  Gemini (298ms) ...   │  │  │
│  │  │                                                     │  │  │
│  │  │                            [📂 Load]  [🗑️]         │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ "Best practices for React performance optimizat..." │  │  │
│  │  │ Nov 26, 2025, 11:45 AM • 2 models                   │  │  │
│  │  │                                                     │  │  │
│  │  │ Llama (187ms)  Claude (412ms)                       │  │  │
│  │  │                                                     │  │  │
│  │  │                            [📂 Load]  [🗑️]         │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │                                          [Close]          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow on "Load History"

```
User clicks "📂 Load" on a history item
         │
         ▼
┌────────────────────────────────────────┐
│  loadHistoryItem(item)                 │
│  ┌──────────────────────────────────┐  │
│  │ setPrompt(item.prompt)           │  │
│  │ setResponses(item.responses)     │  │
│  │ setShowHistoryModal(false)       │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  UI Updates Instantly                  │
│  ┌──────────────────────────────────┐  │
│  │ ✅ Prompt field filled           │  │
│  │ ✅ Response cards displayed      │  │
│  │ ✅ Modal closed                  │  │
│  │ ✅ NO API calls needed!          │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  User Can:                             │
│  • Read previous responses             │
│  • Copy responses                      │
│  • Modify prompt and re-run            │
│  • Compare with new results            │
└────────────────────────────────────────┘
```

## 💾 Save Flow (Auto-save after Comparison)

```
User clicks "Compare Models"
         │
         ▼
┌─────────────────────────────────────────┐
│  handleCompare()                        │
│  1. Validate prompt                     │
│  2. Filter models with API keys         │
│  3. Send parallel API requests          │
│  4. Collect all responses               │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Format Responses                       │
│  [                                      │
│    {                                    │
│      model: "Llama 3.3 70B",           │
│      provider: "groq",                 │
│      response: "AI is...",             │
│      time: 234,                        │
│      wordCount: 150,                   │
│      success: true                     │
│    },                                  │
│    ...                                 │
│  ]                                     │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  🆕 savePromptHistory()                │
│  ┌───────────────────────────────────┐  │
│  │ await supabase                    │  │
│  │   .from('prompt_history')         │  │
│  │   .insert({                       │  │
│  │     user_id: user.id,             │  │
│  │     prompt: prompt,               │  │
│  │     responses: formattedResponses │  │
│  │   })                              │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Reload History List                    │
│  ┌───────────────────────────────────┐  │
│  │ await loadPromptHistory(user.id)  │  │
│  │ History count updates: (4) → (5)  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  ✅ Done! History saved automatically   │
└─────────────────────────────────────────┘
```

## 🔐 Security Architecture

```
┌────────────────────────────────────────────────────────────┐
│  User A (ID: abc-123)                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Prompts:                                             │  │
│  │ • "What is AI?" → [Llama, GPT-5 responses]          │  │
│  │ • "Explain ML" → [Claude, Gemini responses]         │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                            ↕️ RLS: user_id = 'abc-123'
┌────────────────────────────────────────────────────────────┐
│  DATABASE (with RLS)                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ prompt_history table                                 │  │
│  │ • Row 1: user_id='abc-123', prompt="What is AI?"    │  │
│  │ • Row 2: user_id='abc-123', prompt="Explain ML"     │  │
│  │ • Row 3: user_id='xyz-456', prompt="Python tips"    │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                            ↕️ RLS: user_id = 'xyz-456'
┌────────────────────────────────────────────────────────────┐
│  User B (ID: xyz-456)                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Prompts:                                             │  │
│  │ • "Python tips" → [Llama, GPT responses]            │  │
│  │ ❌ CANNOT see User A's prompts!                     │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘

🔒 RLS ensures each user only sees their own data
```

## 📊 Response Data Structure (JSONB)

```json
{
  "responses": [
    {
      "model": "Llama 3.3 70B",
      "provider": "groq",
      "response": "Artificial Intelligence (AI) is a branch of computer science...",
      "time": 234,
      "wordCount": 150,
      "success": true
    },
    {
      "model": "GPT-5",
      "provider": "openai",
      "response": "AI refers to the simulation of human intelligence...",
      "time": 456,
      "wordCount": 200,
      "success": true
    },
    {
      "model": "Claude Opus 4.1",
      "provider": "anthropic",
      "response": "Machine intelligence encompasses...",
      "time": 389,
      "wordCount": 180,
      "success": true
    }
  ]
}
```

## ⚡ Performance Benefits

```
Traditional Approach (Re-run API calls):
┌─────────────────────────────────────────┐
│ User wants to see previous result       │
│         ↓                               │
│ Re-enter prompt                         │
│         ↓                               │
│ Click "Compare Models"                  │
│         ↓                               │
│ Wait 2-5 seconds for API calls         │
│         ↓                               │
│ Responses shown                         │
│                                         │
│ ⏱️ Time: 2-5 seconds                   │
│ 💰 Cost: New API calls                 │
└─────────────────────────────────────────┘

🆕 History Approach (Cached):
┌─────────────────────────────────────────┐
│ User wants to see previous result       │
│         ↓                               │
│ Click "📜 History"                      │
│         ↓                               │
│ Click "📂 Load"                         │
│         ↓                               │
│ Responses shown INSTANTLY               │
│                                         │
│ ⏱️ Time: < 100ms                       │
│ 💰 Cost: FREE (no API calls)           │
└─────────────────────────────────────────┘

✅ 20-50x faster
✅ Zero API costs
✅ Better UX
```

## 🎯 Key Features Summary

| Feature | Description | Status |
|---------|-------------|--------|
| Auto-save | Saves every comparison automatically | ✅ |
| Load history | Click to reload prompt & responses | ✅ |
| Delete | Remove unwanted history items | ✅ |
| Privacy | RLS ensures user data isolation | ✅ |
| Performance | Instant load (no API calls) | ✅ |
| Responsive | Works on mobile, tablet, desktop | ✅ |
| Metadata | Shows timestamp, model count, times | ✅ |
| Preview | See response preview in list | ✅ |

## 🚀 Next Steps

1. Run SQL migration in Supabase
2. Test the feature
3. Enjoy instant access to previous comparisons!
