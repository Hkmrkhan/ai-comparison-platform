# 📜 Prompt History Feature - Implementation Guide

## 🎯 Feature Overview

This feature allows users to:
- ✅ Automatically save every prompt and AI model responses
- ✅ View their complete search history
- ✅ Click any previous prompt to reload it with saved responses
- ✅ Delete unwanted history items
- ✅ See metadata (timestamp, number of models, response times)

## 🗄️ Database Setup

### Step 1: Run the SQL Migration

Execute the SQL file in your Supabase SQL Editor:

**File:** `supabase-migration-prompt-history.sql`

This creates:
- `prompt_history` table with proper schema
- Row Level Security (RLS) policies for user data privacy
- Indexes for performance
- Auto-update triggers for timestamps

```sql
-- Table structure:
- id: UUID (primary key)
- user_id: UUID (references auth.users)
- prompt: TEXT (user's question)
- responses: JSONB (array of AI model responses)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Step 2: Verify RLS Policies

Make sure these policies are active in Supabase Dashboard:
- ✅ Users can view their own prompt history
- ✅ Users can insert their own prompt history
- ✅ Users can update their own prompt history
- ✅ Users can delete their own prompt history

## 🔧 Code Changes

### Files Modified:

1. **src/app/compare/page.tsx**
   - Added `PromptHistory` interface
   - Added state for history management
   - Added `loadPromptHistory()` function
   - Added `savePromptHistory()` function
   - Added `loadHistoryItem()` function
   - Added `deleteHistoryItem()` function
   - Added History button in UI
   - Added History Modal with list view
   - Auto-save after each comparison

## 🚀 How It Works

### User Flow:

```
1. User enters prompt → Clicks "Compare Models"
   ↓
2. AI models process → Responses shown
   ↓
3. Auto-save to database (prompt + responses)
   ↓
4. User clicks "📜 History (X)" button
   ↓
5. Modal shows all previous prompts
   ↓
6. User clicks "📂 Load" on any prompt
   ↓
7. Prompt and saved responses reload instantly
```

### Technical Flow:

```typescript
// After comparison completes:
handleCompare() {
  // ... get responses from AI models
  setResponses(formattedResponses);
  
  // Save to database
  await savePromptHistory(prompt, formattedResponses);
}

// Loading history:
loadPromptHistory(userId) {
  const { data } = await supabase
    .from('prompt_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
}

// Clicking a history item:
loadHistoryItem(item) {
  setPrompt(item.prompt);
  setResponses(item.responses);
  setShowHistoryModal(false);
}
```

## 📊 Data Storage Format

### Database Storage (JSONB):

```json
{
  "id": "uuid-123",
  "user_id": "user-uuid",
  "prompt": "What is machine learning?",
  "responses": [
    {
      "model": "Llama 3.3 70B",
      "provider": "groq",
      "response": "Machine learning is...",
      "time": 234,
      "wordCount": 150,
      "success": true
    },
    {
      "model": "GPT-5",
      "provider": "openai",
      "response": "ML is a subset...",
      "time": 456,
      "wordCount": 200,
      "success": true
    }
  ],
  "created_at": "2025-11-28T10:30:00Z"
}
```

## 🎨 UI Components

### History Button
- Location: Action buttons row (next to "Add Models" and "Manage API Keys")
- Shows count of saved prompts: `📜 History (5)`
- Click opens modal

### History Modal
- **Header**: Shows total count
- **List Items**: Each shows:
  - Prompt text (truncated if > 100 chars)
  - Timestamp and model count
  - Load button (📂)
  - Delete button (🗑️)
  - Response preview chips (model name, time, success status)
- **Empty State**: Friendly message when no history
- **Loading State**: Shows while fetching

## 🔐 Security

### Row Level Security (RLS)
- ✅ Each user can ONLY see their own history
- ✅ No user can access another user's prompts
- ✅ Enforced at database level (not just frontend)

### Privacy
- Prompts and responses are private per user
- No admin access unless explicitly granted via RLS policy
- Data encrypted at rest by Supabase

## 📱 Responsive Design

- **Mobile**: Full-width buttons, stacked layout
- **Tablet**: Optimized spacing
- **Desktop**: Side-by-side actions, wider modal

## ⚡ Performance Optimizations

1. **Limit**: Only load last 20 history items
2. **Indexing**: Database indexes on `user_id` and `created_at`
3. **Lazy Loading**: History loads on page mount, not on every action
4. **JSONB Storage**: Efficient storage and querying of responses

## 🧪 Testing Steps

### 1. Database Setup
```bash
# In Supabase SQL Editor, run:
supabase-migration-prompt-history.sql
```

### 2. Test Flow
1. Open `/compare` page
2. Select models and add API keys
3. Enter a prompt: "What is AI?"
4. Click "Compare Models"
5. Wait for responses
6. Click "📜 History" button
7. Verify prompt appears in list
8. Click "📂 Load" button
9. Verify prompt and responses reload
10. Click "🗑️" to delete
11. Confirm deletion works

### 3. Verify Privacy
1. Login as User A, create prompts
2. Logout, login as User B
3. Verify User B cannot see User A's history

## 🐛 Troubleshooting

### Issue: History doesn't save
- **Check**: RLS policies enabled?
- **Check**: User is authenticated?
- **Check**: Console errors in browser?

### Issue: Can't load history
- **Check**: Table exists in Supabase?
- **Check**: Network tab shows successful API call?
- **Check**: User has permission to read?

### Issue: Delete doesn't work
- **Check**: RLS DELETE policy enabled?
- **Check**: Matching user_id in query?

## 🔄 Future Enhancements

- [ ] Search/filter history by keyword
- [ ] Export history to JSON/CSV
- [ ] Favorite/bookmark specific prompts
- [ ] Share prompt (with permission)
- [ ] Pagination for 100+ history items
- [ ] Analytics (most used models, avg response time)

## 📝 Code Snippets

### Adding to History Programmatically:
```typescript
await supabase
  .from('prompt_history')
  .insert({
    user_id: user.id,
    prompt: "Your prompt here",
    responses: [/* response objects */]
  });
```

### Querying History:
```typescript
const { data } = await supabase
  .from('prompt_history')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

### Deleting History:
```typescript
await supabase
  .from('prompt_history')
  .delete()
  .eq('id', historyId)
  .eq('user_id', userId);
```

## ✅ Implementation Checklist

- [x] Create database table with RLS
- [x] Add state management for history
- [x] Implement save function (auto-save after compare)
- [x] Implement load function (on page mount)
- [x] Add History button to UI
- [x] Create History Modal component
- [x] Implement load history item on click
- [x] Implement delete history item
- [x] Add responsive design
- [x] Add loading states
- [x] Add empty states
- [ ] Run SQL migration in Supabase
- [ ] Test complete flow
- [ ] Verify RLS policies work

## 🎉 Done!

Your AI Comparison Platform now has a complete prompt history feature! Users can track all their AI comparisons and easily revisit previous searches.
