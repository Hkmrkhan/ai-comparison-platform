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

interface UserData {
  id: string;
  email?: string;
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

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedModels, setSelectedModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);

  const dialogues = [
    {
      title: "Welcome to AI Model Comparison",
      message: "Let's set up your account. First, select the AI models you want to compare.",
    },
    {
      title: "Great Choice",
      message: `You've selected ${selectedModels.length} model(s). These models will be available for comparison.`,
    },
    {
      title: "Almost Done",
      message: "Next, you'll add your API keys for each model on the comparison page.",
    },
    {
      title: "You're All Set",
      message: "Click 'Start Comparing' to begin comparing your selected AI models.",
    }
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);

      const { data } = await supabase
        .from('user_preferences')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single();

      if (data?.onboarding_completed) {
        router.push('/compare');
      }
    };

    checkAuth();
  }, [router]);

  const toggleModel = (model: Model) => {
    if (selectedModels.find(m => m.id === model.id)) {
      setSelectedModels(selectedModels.filter(m => m.id !== model.id));
    } else if (selectedModels.length < 7) {
      setSelectedModels([...selectedModels, model]);
    }
  };

  const handleNext = () => {
    if (currentStep === 0 && selectedModels.length === 0) {
      alert('Please select at least one model!');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setLoading(true);

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        selected_models: selectedModels,
        onboarding_completed: true
      });

    if (!error) {
      router.push('/compare');
    } else {
      alert('Error saving preferences. Please try again.');
    }

    setLoading(false);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur-xl">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 subtle-grid opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.14),_transparent_30%)]" />

      {/* Progress Bar - Responsive */}
      <div className="relative border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {dialogues.map((_, idx) => (
              <div key={idx} className="flex items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                    idx <= currentStep
                      ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                      : 'border border-white/10 bg-white/5 text-slate-400'
                  }`}
                >
                  {idx + 1}
                </div>
                {idx < dialogues.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 h-1 ${
                      idx < currentStep ? 'bg-cyan-400' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content - Responsive */}
      <div className="relative max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
        {/* Dialogue Box - Responsive */}
        <div className="glass-panel rounded-[2rem] p-6 sm:p-10 mb-6 sm:mb-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100 shadow-lg shadow-cyan-500/10" />
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3 sm:mb-4">
            {dialogues[currentStep].title}
          </h2>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-300">
            {dialogues[currentStep].message}
          </p>
        </div>

        {/* Model Selection (Only on Step 0) - Responsive */}
        {currentStep === 0 && (
          <div className="glass-panel rounded-[2rem] p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6">
              Select AI Models ({selectedModels.length}/7)
            </h3>
            <p className="text-slate-300 mb-4 sm:mb-6 text-sm sm:text-base">
              Choose which models to compare (select 2-7 models)
            </p>

            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {AVAILABLE_MODELS.map((model) => {
                const isSelected = selectedModels.find(m => m.id === model.id);
                const isDisabled = selectedModels.length >= 7 && !isSelected;

                return (
                  <div
                    key={model.id}
                    onClick={() => !isDisabled && toggleModel(model)}
                    className={`p-3 sm:p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-cyan-400/40 bg-cyan-400/10 shadow-lg shadow-cyan-500/10'
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

            {selectedModels.length > 0 && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
                <p className="text-emerald-200 font-semibold text-sm sm:text-base">
                  {selectedModels.length} model(s) selected
                </p>
              </div>
            )}
          </div>
        )}

        {/* Review Selected Models (Steps 1-3) - Responsive */}
        {currentStep > 0 && (
          <div className="glass-panel rounded-[2rem] p-4 sm:p-6 border-white/10 mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
              Your Selected Models:
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {selectedModels.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 gap-2"
                >
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm sm:text-base">
                      {model.label}
                    </div>
                    <div className="text-slate-400 text-xs sm:text-sm">
                      {model.description}
                    </div>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">Ready</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons - Responsive */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-2xl border border-white/10 bg-white/5 text-sm sm:text-base font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            Back
          </button>

          {currentStep < dialogues.length - 1 ? (
            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-2xl bg-cyan-400 text-sm sm:text-base font-semibold text-slate-950 shadow-[0_20px_50px_rgba(34,211,238,0.18)] transition hover:bg-cyan-300"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading || selectedModels.length === 0}
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-2xl bg-emerald-400 text-sm sm:text-base font-semibold text-slate-950 shadow-[0_20px_50px_rgba(16,185,129,0.18)] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Start Comparing'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}