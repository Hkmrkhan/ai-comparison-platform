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
      title: "Welcome to AI Model Comparison! 👋",
      message: "Let's set up your account. First, select the AI models you want to compare.",
      icon: "🚀"
    },
    {
      title: "Great Choice! 🎯",
      message: `You've selected ${selectedModels.length} model(s). These models will be available for comparison.`,
      icon: "✨"
    },
    {
      title: "Almost Done! 🔑",
      message: "Next, you'll add your API keys for each model on the comparison page.",
      icon: "🎉"
    },
    {
      title: "You're All Set! 🎊",
      message: "Click 'Start Comparing' to begin comparing your selected AI models.",
      icon: "🚀"
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Progress Bar - Responsive */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {dialogues.map((_, idx) => (
              <div key={idx} className="flex items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                    idx <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {idx + 1}
                </div>
                {idx < dialogues.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 h-1 ${
                      idx < currentStep ? 'bg-blue-600' : 'bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content - Responsive */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
        {/* Dialogue Box - Responsive */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 sm:p-8 mb-6 sm:mb-8 text-center border border-blue-700">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">
            {dialogues[currentStep].icon}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
            {dialogues[currentStep].title}
          </h2>
          <p className="text-base sm:text-xl text-slate-200">
            {dialogues[currentStep].message}
          </p>
        </div>

        {/* Model Selection (Only on Step 0) - Responsive */}
        {currentStep === 0 && (
          <div className="bg-slate-800 rounded-lg p-4 sm:p-6 border border-slate-700 mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
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

            {selectedModels.length > 0 && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-900 bg-opacity-20 border border-green-700 rounded-lg">
                <p className="text-green-400 font-semibold text-sm sm:text-base">
                  ✅ {selectedModels.length} model(s) selected
                </p>
              </div>
            )}
          </div>
        )}

        {/* Review Selected Models (Steps 1-3) - Responsive */}
        {currentStep > 0 && (
          <div className="bg-slate-800 rounded-lg p-4 sm:p-6 border border-slate-700 mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
              Your Selected Models:
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {selectedModels.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between bg-slate-700 p-3 sm:p-4 rounded-lg gap-2"
                >
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm sm:text-base">
                      {model.label}
                    </div>
                    <div className="text-slate-400 text-xs sm:text-sm">
                      {model.description}
                    </div>
                  </div>
                  <div className="text-green-400 text-lg sm:text-xl">✓</div>
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
            className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg transition text-sm sm:text-base"
          >
            ← Back
          </button>

          {currentStep < dialogues.length - 1 ? (
            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-sm sm:text-base"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading || selectedModels.length === 0}
              className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                  Saving...
                </>
              ) : (
                '🚀 Start Comparing'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}