# 🔄 Prompt History - API Implementation

## Overview
History save/load/delete functionality ab **API routes** ke through kaam kar rahi hai instead of direct Supabase client calls.

---

## 📁 File Structure

```
src/
├── app/
│   ├── api/
│   │   └── history/
│   │       ├── route.ts           # GET & POST endpoints
│   │       └── [id]/
│   │           └── route.ts       # DELETE endpoint
│   └── compare/
│       └── page.tsx               # Updated to use API routes
└── lib/
    └── api-helpers.ts             # Reusable auth utilities
```

---

## 🛣️ API Routes

### 1. **GET /api/history**
**Load user's prompt history**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "history": [
    {
      "id": "uuid",
      "prompt": "User's prompt",
      "responses": [...],
      "created_at": "timestamp",
      "user_id": "uuid"
    }
  ]
}
```

---

### 2. **POST /api/history**
**Save new prompt history**

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "prompt": "User's prompt text",
  "responses": [
    {
      "model": "GPT-4",
      "provider": "openai",
      "response": "AI response text",
      "time": 1234,
      "wordCount": 150,
      "success": true
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### 3. **DELETE /api/history/[id]**
**Delete a specific history item**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "History deleted successfully"
}
```

---

## 🔐 Security Features

### Authentication
- **Bearer Token**: Har API call mein user ka access token required hai
- **RLS Policies**: Supabase Row Level Security ensure karta hai user apni hi data access kar sake

### Token Validation
```typescript
const { data: { user }, error } = await supabase.auth.getUser();
if (authError || !user) {
  return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
}
```

### User Isolation
```sql
-- RLS ensures users only see their own data
.eq('user_id', user.id)
```

---

## 🛠️ Helper Utilities

### `api-helpers.ts`

**1. Get Auth Token**
```typescript
const token = await getAuthToken();
```

**2. Authenticated Fetch**
```typescript
const response = await authenticatedFetch('/api/history', {
  method: 'GET'
});
```

Automatically:
- ✅ Gets auth token
- ✅ Sets Authorization header
- ✅ Sets Content-Type header
- ✅ Handles errors

---

## 📱 Client-Side Usage

### Load History
```typescript
const loadPromptHistory = async () => {
  const response = await authenticatedFetch('/api/history', {
    method: 'GET'
  });
  
  if (response.ok) {
    const { history } = await response.json();
    setPromptHistory(history);
  }
};
```

### Save History
```typescript
const savePromptHistory = async (prompt: string, responses: ModelResponse[]) => {
  await authenticatedFetch('/api/history', {
    method: 'POST',
    body: JSON.stringify({ prompt, responses })
  });
  
  await loadPromptHistory(); // Refresh
};
```

### Delete History
```typescript
const deleteHistoryItem = async (historyId: string) => {
  await authenticatedFetch(`/api/history/${historyId}`, {
    method: 'DELETE'
  });
  
  await loadPromptHistory(); // Refresh
};
```

---

## 🔄 Migration Summary

### Before (Direct Supabase)
```typescript
// ❌ Old way
const { data } = await supabase
  .from('prompt_history')
  .select('*')
  .eq('user_id', user.id);
```

### After (API Routes)
```typescript
// ✅ New way
const response = await authenticatedFetch('/api/history');
const { history } = await response.json();
```

---

## ✅ Benefits

1. **Better Security** 🔒
   - Token validation server-side
   - API keys hidden from client
   - Centralized authentication

2. **Easier Maintenance** 🛠️
   - Single source of truth
   - Reusable API endpoints
   - Cleaner client code

3. **Scalability** 📈
   - Add caching easily
   - Rate limiting possible
   - API versioning support

4. **Testing** 🧪
   - Easier to mock APIs
   - Better error handling
   - Testable endpoints

---

## 🚀 Testing the APIs

### Using Browser DevTools
```javascript
// Get session token
const { data: { session } } = await supabase.auth.getSession();
const token = session.access_token;

// Test GET
fetch('/api/history', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log);

// Test POST
fetch('/api/history', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'Test prompt',
    responses: []
  })
})
.then(r => r.json())
.then(console.log);
```

---

## 📊 Database Schema (Unchanged)

```sql
CREATE TABLE prompt_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  prompt TEXT NOT NULL,
  responses JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies remain the same
ALTER TABLE prompt_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own history"
  ON prompt_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history"
  ON prompt_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own history"
  ON prompt_history FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 🎯 Next Steps

1. ✅ API routes created
2. ✅ Client updated to use APIs
3. ✅ Helper utilities added
4. 🔄 Test all functionality
5. 🚀 Deploy to production

---

## 📝 Notes

- **Backward Compatible**: Supabase client still available for other features
- **Type Safety**: Full TypeScript support maintained
- **Error Handling**: Comprehensive try-catch blocks added
- **User Experience**: No changes to UI/UX, only backend implementation

---

Made with ❤️ by migrating from direct Supabase calls to API routes!
