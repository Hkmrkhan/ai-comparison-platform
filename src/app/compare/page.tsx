'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Model {
  id: string;
  name: string;
  label: string;
  description: string;
  provider: string;
}

interface APIKeys {
  [provider: string]: string;
}

interface ModelResponse {
  model: string;
  provider: string;
  response: string;
  time: number;
  wordCount: number;
  success: boolean;
}

interface UserData {
  id: string;
  email?: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };
}

const AVAILABLE_MODELS: Model[] = [
  {
    id: '1',
    name: 'llama-3.3-70b-versatile',
    label: 'Llama 3.3 70B',
    description: 'Latest flagship - Best for complex tasks',
    provider: 'groq'
  },
  {
    id: '2',
    name: 'llama-3.1-8b-instant',
    label: 'Llama 3.1 8B',
    description: 'Speed champion - 560 tokens/sec',
    provider: 'groq'
  },
  {
    id: '3',
    name: 'qwen/qwen3-32b',
    label: 'Qwen 3 32B',
    description: 'Alibaba Cloud model - 400 tokens/sec',
    provider: 'groq'
  },
  {
    id: '4',
    name: 'gpt-5',
    label: 'GPT-5',
    description: 'Latest OpenAI flagship model',
    provider: 'openai'
  },
  {
    id: '5',
    name: 'gpt-4.1',
    label: 'GPT-4.1',
    description: 'Advanced reasoning model',
    provider: 'openai'
  },
  {
    id: '6',
    name: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    description: 'Latest stable - Fast & efficient',
    provider: 'google'
  },
  {
    id: '7',
    name: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    description: 'Most capable Gemini model',
    provider: 'google'
  },
  {
    id: '8',
    name: 'claude-opus-4-1-20250805',
    label: 'Claude Opus 4.1',
    description: 'Most intelligent Claude model - Aug 2025',
    provider: 'anthropic'
  },
  {
    id: '9',
    name: 'claude-sonnet-4-5-20250929',
    label: 'Claude Sonnet 4.5',
    description: 'Latest Claude model - Sep 2025',
    provider: 'anthropic'
  }
];

interface PromptHistory {
  id: string;
  prompt: string;
  responses: ModelResponse[];
  created_at: string;
}

export default function ComparePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [selectedModels, setSelectedModels] = useState<Model[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKeys>({});
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showAddModelsModal, setShowAddModelsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState<ModelResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [promptHistory, setPromptHistory] = useState<PromptHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);

      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If user hasn't completed onboarding, redirect
      if (!data || !data.onboarding_completed) {
        router.push('/onboarding');
        return;
      }

      setSelectedModels(data.selected_models || []);
      setApiKeys(data.api_keys || {});

      // Load prompt history
      await loadPromptHistory(user.id);
    };

    loadUserData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const loadPromptHistory = async (userId: string) => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('prompt_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setPromptHistory(data);
      }
    } catch (error) {
      console.error('Error loading prompt history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const savePromptHistory = async (prompt: string, responses: ModelResponse[]) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('prompt_history')
        .insert({
          user_id: user.id,
          prompt,
          responses
        });

      if (!error) {
        // Reload history after saving
        await loadPromptHistory(user.id);
      }
    } catch (error) {
      console.error('Error saving prompt history:', error);
    }
  };

  const loadHistoryItem = (historyItem: PromptHistory) => {
    setPrompt(historyItem.prompt);
    setResponses(historyItem.responses);
    setShowHistoryModal(false);
  };

  const deleteHistoryItem = async (historyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('prompt_history')
        .delete()
        .eq('id', historyId)
        .eq('user_id', user.id);

      if (!error) {
        await loadPromptHistory(user.id);
      }
    } catch (error) {
      console.error('Error deleting prompt history:', error);
    }
  };

  const handleSaveApiKeys = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('user_preferences')
      .update({ api_keys: apiKeys })
      .eq('user_id', user.id);

    if (!error) {
      setShowApiKeyModal(false);
      alert('API Keys saved successfully! ✅');
    }
  };

  const toggleModelSelection = (model: Model) => {
    if (selectedModels.find(m => m.id === model.id)) {
      setSelectedModels(selectedModels.filter(m => m.id !== model.id));
    } else if (selectedModels.length < 7) {
      setSelectedModels([...selectedModels, model]);
    }
  };

  const handleSaveSelectedModels = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('user_preferences')
      .update({ selected_models: selectedModels })
      .eq('user_id', user.id);

    if (!error) {
      setShowAddModelsModal(false);
      alert('Models updated successfully! ✅');
    }
  };

  const handleCompare = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt!');
      return;
    }

    // Filter only models that have API keys
    const modelsWithKeys = selectedModels.filter(
      model => apiKeys[model.provider]
    );

    if (modelsWithKeys.length === 0) {
      alert('Please add API keys for at least one model!');
      setShowApiKeyModal(true);
      return;
    }

    setLoading(true);

    try {
      const results = await Promise.allSettled(
        modelsWithKeys.map(async (model) => {
          const startTime = performance.now();
          
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: model.name,
              prompt,
              provider: model.provider,
              apiKey: apiKeys[model.provider]
            })
          });

          const data = await response.json();
          const endTime = performance.now();

          return {
            model: model.label,
            provider: model.provider,
            response: data.response || data.error || 'No response',
            time: Math.round(endTime - startTime),
            wordCount: data.response ? data.response.split(/\s+/).length : 0,
            success: !data.error
          };
        })
      );

      const formattedResponses = results.map((result): ModelResponse => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        return {
          model: 'Unknown',
          provider: 'unknown',
          response: 'Request failed',
          time: 0,
          wordCount: 0,
          success: false
        };
      });

      setResponses(formattedResponses);

      // Save prompt history to database
      await savePromptHistory(prompt, formattedResponses);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during comparison');
    }

    setLoading(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getUniqueProviders = () => {
    const providers = new Set(selectedModels.map(m => m.provider));
    return Array.from(providers);
  };

  // Count how many models have API keys
  const modelsWithApiKeys = selectedModels.filter(m => apiKeys[m.provider]).length;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const userName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              AI Model Comparison
            </h1>
            <p className="text-slate-400 mt-1 sm:mt-2 text-sm sm:text-base">
              Welcome, {userName}! 👋
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition text-sm sm:text-base"
          >
            Logout
          </button>
        </div>

        {/* Action Buttons - Responsive */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <button
            onClick={() => setShowAddModelsModal(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            Add Models
          </button>
          <button
            onClick={() => setShowApiKeyModal(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            Manage API Keys
          </button>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            📜 History ({promptHistory.length})
          </button>
        </div>

        {/* Selected Models - Responsive Grid */}
        <div className="bg-slate-800 rounded-lg p-4 sm:p-6 mb-6 border border-slate-700">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
            Your Selected Models ({selectedModels.length})
            {selectedModels.length > 0 && (
              <span className="text-xs sm:text-sm font-normal text-slate-400 ml-2 sm:ml-3">
                ({modelsWithApiKeys} with API keys)
              </span>
            )}
          </h3>
          {selectedModels.length === 0 ? (
            <p className="text-slate-400 text-sm sm:text-base">
              No models selected. Click &quot;Add Models&quot; to get started.
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {selectedModels.map((model) => (
                <div
                  key={model.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-slate-700 p-3 sm:p-4 rounded-lg gap-2"
                >
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm sm:text-base">
                      {model.label}
                    </div>
                    <div className="text-slate-400 text-xs sm:text-sm">
                      {model.description}
                    </div>
                  </div>
                  <div className={`text-xs sm:text-sm font-semibold ${apiKeys[model.provider] ? 'text-green-400' : 'text-red-400'}`}>
                    {apiKeys[model.provider] ? '✓ API Key Set' : '✗ No API Key'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prompt Input - Responsive */}
        <div className="bg-slate-800 rounded-lg p-4 sm:p-6 mb-6 border border-slate-700">
          <label className="block text-white font-semibold mb-3 text-sm sm:text-base">
            Enter Your Prompt:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your question or prompt here..."
            className="w-full h-24 sm:h-32 bg-slate-700 border border-slate-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
          />
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
            <button
              onClick={handleCompare}
              disabled={loading || !prompt.trim() || modelsWithApiKeys === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray="60"
                    />
                  </svg>
                  Comparing...
                </>
              ) : (
                '⚡ Compare Models'
              )}
            </button>
            {prompt && (
              <button
                onClick={() => {
                  setPrompt('');
                  setResponses([]);
                }}
                className="sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg text-sm sm:text-base"
              >
                Cancel
              </button>
            )}
          </div>
          {modelsWithApiKeys === 0 && selectedModels.length > 0 && (
            <p className="text-yellow-400 text-xs sm:text-sm mt-3">
              ⚠️ Please add API keys for at least one model to start comparison
            </p>
          )}
        </div>

        {/* Results - Responsive */}
        {responses.length > 0 && (
          <div className="space-y-4">
            {responses.map((response, idx) => (
              <div
                key={idx}
                className={`bg-slate-800 rounded-lg p-4 sm:p-6 border-2 ${
                  response.success ? 'border-green-700' : 'border-red-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {response.model}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400">
                      {response.provider}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(response.response, `response-${idx}`)}
                    className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg transition text-sm ${
                      copied === `response-${idx}`
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                  >
                    {copied === `response-${idx}` ? '✓ Copied!' : ' Copy'}
                  </button>
                </div>
                <p className="text-slate-300 mb-4 leading-relaxed whitespace-pre-wrap text-sm sm:text-base break-words">
                  {response.response}
                </p>
                <div className="flex flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm text-slate-400">
                  <span> {response.time}ms</span>
                  <span> {response.wordCount} words</span>
                  <span className={response.success ? 'text-green-400' : 'text-red-400'}>
                    {response.success ? '✓ Success' : '✗ Failed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Models Modal - Responsive */}
      {showAddModelsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-4 sm:p-8 max-w-4xl w-full mx-4 border border-slate-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
              Add Models ({selectedModels.length}/7)
            </h2>
            
            <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {AVAILABLE_MODELS.map((model) => {
                const isSelected = selectedModels.find(m => m.id === model.id);
                const isDisabled = selectedModels.length >= 7 && !isSelected;

                return (
                  <div
                    key={model.id}
                    onClick={() => !isDisabled && toggleModelSelection(model)}
                    className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                        : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        readOnly
                        className="mt-1"
                        disabled={isDisabled}
                      />
                      <div className="flex-1">
                        <div className="font-bold text-white text-base sm:text-lg mb-1">
                          {model.label}
                        </div>
                        <div className="text-slate-400 text-xs sm:text-sm">
                          {model.description}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleSaveSelectedModels}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 sm:py-3 rounded-lg text-sm sm:text-base"
              >
                Save Selected Models
              </button>
              <button
                onClick={() => setShowAddModelsModal(false)}
                className="sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal - Responsive */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-4 sm:p-8 max-w-2xl w-full mx-4 border border-slate-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
               Manage API Keys
            </h2>
            
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {getUniqueProviders().map((provider) => (
                <div key={provider}>
                  <label className="block text-white font-semibold mb-2 capitalize text-sm sm:text-base">
                    {provider} API Key:
                  </label>
                  <input
                    type="password"
                    value={apiKeys[provider] || ''}
                    onChange={(e) =>
                      setApiKeys({ ...apiKeys, [provider]: e.target.value })
                    }
                    placeholder={`Enter your ${provider} API key`}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
              ))}
            </div>

            <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-yellow-100 text-xs sm:text-sm">
                <strong>Security:</strong> Your API keys are stored securely in our database and only accessible by you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleSaveApiKeys}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 sm:py-3 rounded-lg text-sm sm:text-base"
              >
                Save API Keys
              </button>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal - Responsive */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-4 sm:p-8 max-w-4xl w-full mx-4 border border-slate-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
              📜 Prompt History ({promptHistory.length})
            </h2>
            
            {loadingHistory ? (
              <div className="text-center py-8">
                <div className="text-white">Loading history...</div>
              </div>
            ) : promptHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm sm:text-base">
                  No prompt history yet. Start comparing AI models to build your history!
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {promptHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 sm:p-4 rounded-lg bg-slate-700 hover:bg-slate-650 border border-slate-600 transition"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm sm:text-base mb-1">
                          {item.prompt.length > 100 ? `${item.prompt.substring(0, 100)}...` : item.prompt}
                        </p>
                        <p className="text-slate-400 text-xs sm:text-sm">
                          {new Date(item.created_at).toLocaleString()} • {item.responses.length} models
                        </p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => loadHistoryItem(item)}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition"
                        >
                          📂 Load
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this prompt history?')) {
                              deleteHistoryItem(item.id);
                            }
                          }}
                          className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    {/* Preview of responses */}
                    <div className="mt-3 pt-3 border-t border-slate-600">
                      <p className="text-slate-400 text-xs mb-2">Responses:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.responses.map((resp, idx) => (
                          <span
                            key={idx}
                            className={`text-xs px-2 py-1 rounded ${
                              resp.success ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                            }`}
                          >
                            {resp.model} ({resp.time}ms)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}