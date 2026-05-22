'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { authenticatedFetch } from '@/lib/api-helpers';

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
  const responseScrollRefs = useRef<Array<HTMLDivElement | null>>([]);
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
      await loadPromptHistory();
    };

    loadUserData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const loadPromptHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await authenticatedFetch('/api/history', {
        method: 'GET'
      });

      if (response.ok) {
        const { history } = await response.json();
        setPromptHistory(history);
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
      const response = await authenticatedFetch('/api/history', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          responses
        })
      });

      if (response.ok) {
        // Reload history after saving
        await loadPromptHistory();
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
      const response = await authenticatedFetch(`/api/history/${historyId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadPromptHistory();
        console.log('History deleted successfully');
      } else {
        const error = await response.json();
        console.error('Delete failed:', error);
        alert('Failed to delete history: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting prompt history:', error);
      alert('Error deleting history. Please try again.');
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
      alert('API Keys saved successfully!');
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
      alert('Models updated successfully!');
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

      // Clear the prompt input field after successful comparison
      setPrompt('');
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

  const bestResponseIndex = responses.reduce((bestIndex, response, index, array) => {
    if (!response.success) {
      return bestIndex;
    }

    if (bestIndex === -1) {
      return index;
    }

    const currentBest = array[bestIndex];

    if (!currentBest.success) {
      return index;
    }

    if (response.wordCount !== currentBest.wordCount) {
      return response.wordCount > currentBest.wordCount ? index : bestIndex;
    }

    if (response.time !== currentBest.time) {
      return response.time < currentBest.time ? index : bestIndex;
    }

    return index < bestIndex ? index : bestIndex;
  }, -1);

  const scrollResponseCard = (index: number) => {
    const responseElement = responseScrollRefs.current[index];

    if (!responseElement) {
      return;
    }

    responseElement.scrollTo({
      top: responseElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  const getUniqueProviders = () => {
    const providers = new Set(selectedModels.map(m => m.provider));
    return Array.from(providers);
  };

  // Count how many models have API keys
  const modelsWithApiKeys = selectedModels.filter(m => apiKeys[m.provider]).length;

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur-xl">
          Loading...
        </div>
      </div>
    );
  }

  const userName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 p-3 text-white sm:p-6">
      <div className="absolute inset-0 subtle-grid opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.14),_transparent_30%)]" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header - Responsive */}
        <div className="glass-panel mb-6 rounded-[2rem] p-4 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between xl:gap-6">
            <div className="flex max-w-3xl items-start gap-3 sm:gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-lg font-semibold text-cyan-100 shadow-lg shadow-cyan-500/10">
                AI
              </div>
              <div className="space-y-2">
                <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                  Comparison workspace
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    AI Model Comparison
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                    Welcome, {userName}. Compare models, manage provider keys, and review saved history from one focused workspace.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-4 xl:justify-end xl:pr-1">
              <button
                onClick={() => setShowAddModelsModal(true)}
                className="h-12 w-full min-w-[10.5rem] rounded-2xl bg-cyan-400 px-4 text-sm sm:text-base font-semibold text-slate-950 shadow-[0_20px_50px_rgba(34,211,238,0.18)] transition hover:bg-cyan-300"
              >
                Add Models
              </button>
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="h-12 w-full min-w-[10.5rem] rounded-2xl border border-white/10 bg-white/5 px-4 text-sm sm:text-base font-semibold text-white transition hover:bg-white/10"
              >
                Manage API Keys
              </button>
              <button
                onClick={() => setShowHistoryModal(true)}
                className="h-12 w-full min-w-[10.5rem] rounded-2xl border border-white/10 bg-white/5 px-4 text-sm sm:text-base font-semibold text-white transition hover:bg-white/10"
              >
                History ({promptHistory.length})
              </button>
              <button
                onClick={handleLogout}
                className="h-12 w-full min-w-[10.5rem] rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/15 px-4 text-sm sm:text-base font-semibold text-fuchsia-100 shadow-[0_18px_45px_rgba(217,70,239,0.14)] transition hover:bg-fuchsia-500/25 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Selected Models - Responsive Grid */}
        <div className="glass-panel rounded-[2rem] p-4 sm:p-6 mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">
            Your Selected Models
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
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 gap-2"
                >
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm sm:text-base">
                      {model.label}
                    </div>
                    <div className="text-slate-400 text-xs sm:text-sm">
                      {model.description}
                    </div>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs sm:text-sm font-semibold ${apiKeys[model.provider] ? 'bg-emerald-400/10 text-emerald-200 border border-emerald-400/20' : 'bg-rose-400/10 text-rose-200 border border-rose-400/20'}`}>
                    {apiKeys[model.provider] ? 'API Key Set' : 'No API Key'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prompt Input - Responsive */}
        <div className="glass-panel rounded-[2rem] p-4 sm:p-6 mb-6">
          <label className="block text-white font-semibold mb-3 text-sm sm:text-base">
            Enter Your Prompt:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your question or prompt here..."
            className="w-full h-28 sm:h-40 rounded-3xl border border-white/10 bg-slate-950/50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none focus:ring-4 focus:ring-cyan-400/10"
          />
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
            <button
              onClick={handleCompare}
              disabled={loading || !prompt.trim() || modelsWithApiKeys === 0}
              className="flex-1 rounded-2xl bg-cyan-400 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-slate-950 shadow-[0_20px_50px_rgba(34,211,238,0.18)] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {loading ? 'Comparing...' : 'Compare Models'}
            </button>
            {prompt && (
              <button
                onClick={() => {
                  setPrompt('');
                  setResponses([]);
                }}
                className="sm:w-auto rounded-2xl border border-white/10 bg-white/5 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-white/10"
              >
                Cancel
              </button>
            )}
          </div>
          {modelsWithApiKeys === 0 && selectedModels.length > 0 && (
            <p className="text-amber-200 text-xs sm:text-sm mt-3">
              ⚠️ Please add API keys for at least one model to start comparison
            </p>
          )}
        </div>

        {/* Results - Responsive */}
        {responses.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] gap-4">
            {responses.map((response, idx) => (
              <div
                key={idx}
                onClick={() => scrollResponseCard(idx)}
                className={`flex h-[30rem] min-h-[30rem] w-full cursor-pointer flex-col overflow-hidden rounded-[2rem] border p-4 sm:p-5 transition-all duration-300 ${
                  idx === bestResponseIndex
                    ? 'border-amber-300/60 bg-[linear-gradient(180deg,rgba(251,191,36,0.16),rgba(15,23,42,0.88))] shadow-[0_30px_90px_rgba(251,191,36,0.16)] ring-1 ring-amber-300/30 md:scale-[1.01]'
                    : response.success
                      ? 'border-emerald-400/20 bg-white/5'
                      : 'border-rose-400/20 bg-white/5'
                }`}
              >
                {idx === bestResponseIndex && (
                  <div className="mb-3 inline-flex w-fit rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-100">
                    Best response
                  </div>
                )}
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white">
                      {response.model}
                    </h3>
                  </div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleCopy(response.response, `response-${idx}`);
                    }}
                    className={`w-full sm:w-auto rounded-2xl px-3 sm:px-4 py-2 text-sm transition ${
                      copied === `response-${idx}`
                        ? 'bg-emerald-400 text-slate-950'
                        : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {copied === `response-${idx}` ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div
                  ref={(element) => {
                    responseScrollRefs.current[idx] = element;
                  }}
                  className={`flex-1 overflow-y-auto rounded-2xl border p-4 text-sm leading-7 sm:text-base ${
                    idx === bestResponseIndex
                      ? 'border-amber-300/20 bg-slate-950/55 text-amber-50'
                      : 'border-white/10 bg-slate-950/40 text-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {response.response}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs sm:text-sm text-slate-400">
                  <span>{response.time}ms</span>
                  <span>{response.wordCount} words</span>
                  <span className={idx === bestResponseIndex ? 'text-amber-200' : response.success ? 'text-emerald-300' : 'text-rose-300'}>
                    {idx === bestResponseIndex ? 'Top response' : response.success ? 'Success' : 'Failed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Models Modal - Responsive */}
      {showAddModelsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="glass-panel max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border-white/10 p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6">
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
                    className={`p-3 sm:p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-cyan-400/40 bg-cyan-400/10'
                        : 'border-white/10 bg-white/5 hover:border-cyan-400/30 hover:bg-white/8'
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
                        <div className="font-semibold text-white text-base sm:text-lg mb-1">
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
                disabled={selectedModels.length < 2}
                className="flex-1 rounded-2xl bg-cyan-400 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                Save Selected Models {selectedModels.length < 2 && `(${selectedModels.length}/2 minimum)`}
              </button>
              <button
                onClick={() => setShowAddModelsModal(false)}
                className="sm:w-auto rounded-2xl border border-white/10 bg-white/5 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal - Responsive */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="glass-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border-white/10 p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6">
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
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none focus:ring-4 focus:ring-cyan-400/10"
                  />
                </div>
              ))}
            </div>

            <div className="mb-4 sm:mb-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3 sm:p-4">
              <p className="text-amber-100 text-xs sm:text-sm">
                <strong>Security:</strong> Your API keys are stored securely in our database and only accessible by you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleSaveApiKeys}
                disabled={Object.values(apiKeys).every(key => !key || key.trim() === '')}
                className="flex-1 rounded-2xl bg-cyan-400 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                Save API Keys
              </button>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="sm:w-auto rounded-2xl border border-white/10 bg-white/5 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal - Responsive */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="glass-panel max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border-white/10 p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6">
              Prompt History ({promptHistory.length})
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
                    className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 transition hover:bg-white/8"
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
                          className="flex-1 sm:flex-none rounded-2xl bg-cyan-400 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this prompt history?')) {
                              deleteHistoryItem(item.id);
                            }
                          }}
                          className="px-3 sm:px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                          Delete
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
                            className={`text-xs px-2 py-1 rounded-full ${
                              resp.success ? 'bg-emerald-400/10 text-emerald-200 border border-emerald-400/20' : 'bg-rose-400/10 text-rose-200 border border-rose-400/20'
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
                className="rounded-2xl border border-white/10 bg-white/5 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-white/10"
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