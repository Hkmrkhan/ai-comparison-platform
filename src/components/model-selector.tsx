"use client";

import { AI_MODELS, type AIModel } from '@/lib/ai-models';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ModelSelectorProps {
  selectedModels: string[];
  onModelSelect: (modelId: string, checked: boolean) => void;
  maxModels?: number; // ✅ Changed default to 3
}

export function ModelSelector({ 
  selectedModels, 
  onModelSelect,
  maxModels = 3  // ✅ CHANGED: 4 → 3
}: ModelSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select AI Models</CardTitle>
        {/* ✅ CHANGED: 2-4 models → 2-3 models */}
        <CardDescription>
          Choose which models to compare (select 2-3 models)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {AI_MODELS.map((model: AIModel) => {
          const isSelected = selectedModels.includes(model.id);
          const isDisabled = !isSelected && selectedModels.length >= maxModels;
          
          return (
            <div key={model.id} className="flex items-center space-x-3">
              <Checkbox
                id={model.id}
                checked={isSelected}
                onCheckedChange={(checked) => {
                  const isChecked = checked === true;
                  onModelSelect(model.id, isChecked);
                }}
                disabled={isDisabled}
              />
              <Label htmlFor={model.id} className="flex-1 cursor-pointer">
                <div className="font-medium">{model.name}</div>
                <div className="text-sm text-muted-foreground">
                  {model.description}
                </div>
              </Label>
            </div>
          );
        })}
        
        {selectedModels.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              ✅ Selected: {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''}
              {/* ✅ CHANGED: Maximum 3 */}
              {selectedModels.length >= maxModels && ' (Maximum reached)'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}