"use client";

import { useState, useEffect } from "react";
import { TemplateCard } from "./TemplateCard";
import { Sparkles, Loader2 } from "lucide-react";

interface Template {
  id: string;
  title: string;
  description: string | null;
  discipline: string | null;
  category: string;
}

interface TemplateSelectorProps {
  selectedTemplateId: string | null;
  onSelect: (id: string | null) => void;
  discipline?: string;
}

export function TemplateSelector({ selectedTemplateId, onSelect, discipline }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setIsLoading(true);
        const url = discipline 
          ? `/api/templates?discipline=${encodeURIComponent(discipline)}` 
          : "/api/templates";
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch templates");
        const data = await response.json();
        setTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTemplates();
  }, [discipline]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 text-sunny animate-spin" />
        <p className="text-gray-500 font-body animate-pulse">Loading templates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-red-50 border-2 border-red-100 rounded-2xl">
        <p className="text-red-800 font-body">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 text-sm font-bold text-red-600 underline uppercase tracking-widest hover:text-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sunny font-handwritten text-lg">
          <Sparkles className="w-4 h-4" />
          Choose a Structure (Optional)
        </div>
        {selectedTemplateId && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-crimson transition-colors"
          >
            Clear Selection
          </button>
        )}
      </div>

      {templates.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
          <p className="text-gray-500 font-body">No templates found for this discipline yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplateId === template.id}
              onSelect={(id) => onSelect(id === selectedTemplateId ? null : id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
