'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AIService, type ModelResponse } from '@/lib/ai-service';
import { AI_MODELS, type AIModel } from '@/lib/ai-models';

export default function ComparePage() {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState<ModelResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const aiService = new AIService();

  const handleModelSelect = (modelId: string, checked: boolean | 'indeterminate'): void => {
    const isChecked = checked === true;
    
    setSelectedModels(prev => {
      const currentModels = Array.from(new Set(prev));
      
      if (isChecked) {
        if (!currentModels.includes(modelId) && currentModels.length < 3) {
          return [...currentModels, modelId];
        }
        return currentModels;
      } else {
        return currentModels.filter(id => id !== modelId);
      }
    });
  };

  const handleCompare = async (): Promise<void> => {
    const uniqueModels = Array.from(new Set(selectedModels));
    
    if (uniqueModels.length === 0) {
      alert('Please select at least one model');
      return;
    }
    
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    setLoading(true);
    setResults([]);
    
    try {
      const comparisonResults = await aiService.compareModels(uniqueModels, prompt);
      setResults(comparisonResults);
    } catch (error) {
      console.error('Comparison failed:', error);
      alert('Comparison failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Cancel button handler
  const handleCancel = () => {
    setPrompt('');
    setResults([]);
  };

  const uniqueSelectedModels = Array.from(new Set(selectedModels));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* ✅ NEW: Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare AI Models</h1>
          <p className="text-gray-600">Enter a prompt and select models to compare</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Model Selection */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Select AI Models</h2>
            <p className="text-gray-600 text-sm mb-4">
              Choose which models to compare (select 2-3 models)
            </p>
            
            <div className="space-y-3">
              {AI_MODELS.map((model: AIModel) => {
                const isSelected = uniqueSelectedModels.includes(model.id);
                const isDisabled = !isSelected && uniqueSelectedModels.length >= 3;
                
                return (
                  <div 
                    key={`model-${model.id}`}
                    className={`flex items-start space-x-3 p-3 rounded-lg border transition-all ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => {
                      if (!isDisabled) {
                        handleModelSelect(model.id, !isSelected);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      id={`checkbox-${model.id}`}
                      className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleModelSelect(model.id, e.target.checked);
                      }}
                    />
                    <label htmlFor={`checkbox-${model.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium text-gray-900">{model.name}</div>
                      <div className="text-sm text-gray-500">{model.description}</div>
                    </label>
                  </div>
                );
              })}
            </div>

            {/* Selected count indicator */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                {uniqueSelectedModels.length === 0 ? (
                  '❌ No models selected'
                ) : (
                  <>
                    ✅ Selected: {uniqueSelectedModels.length} model{uniqueSelectedModels.length !== 1 ? 's' : ''}
                    {uniqueSelectedModels.length >= 3 && ' (Maximum reached)'}
                  </>
                )}
              </p>
              {uniqueSelectedModels.length > 0 && (
                <div className="mt-2 text-xs text-blue-700 space-y-1">
                  {uniqueSelectedModels.map((id, index) => {
                    const model = AI_MODELS.find(m => m.id === id);
                    return (
                      <div key={`selected-list-${id}`}>
                        {index + 1}. {model?.name || id}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Enter Your Prompt</h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What is artificial intelligence?"
              className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            
            {/* ✅ UPDATED: Compare & Cancel Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCompare}
                disabled={loading || uniqueSelectedModels.length === 0 || !prompt.trim()}
                className="flex-1 bg-black hover:bg-gray-800 text-white py-3 px-6 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '🔄 Comparing Models...' : 'Compare Models'}
              </button>

              {/* ✅ NEW: Cancel Button - Only show if there's text or results */}
              {(prompt.trim() || results.length > 0) && (
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-6 py-3 border-2 border-gray-300 hover:border-red-500 text-gray-700 hover:text-red-600 rounded-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              )}
            </div>
            
            {uniqueSelectedModels.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ Please select at least one model to continue
              </p>
            )}
            
            {!prompt.trim() && uniqueSelectedModels.length > 0 && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ Please enter a prompt to continue
              </p>
            )}
          </div>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Comparison Results</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {results.map((result: ModelResponse, index: number) => {
                const modelInfo = AI_MODELS.find((m: AIModel) => m.id === result.model);
                return (
                  <div key={`result-${result.model}-${index}`} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {modelInfo?.name || result.model}
                      </h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {result.responseTime}ms
                      </span>
                    </div>
                    
                    <div className="prose prose-sm max-w-none mb-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {result.response}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <div>
                        {result.success ? (
                          <span className="text-green-600 font-medium">✅ Success</span>
                        ) : (
                          <span className="text-red-600 font-medium">❌ Error</span>
                        )}
                      </div>
                      <span>{result.wordCount} words</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}