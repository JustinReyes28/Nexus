import { Target, BookOpen, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  template: {
    id: string;
    title: string;
    description: string | null;
    discipline: string | null;
    category: string;
  };
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  return (
    <div
      onClick={() => onSelect(template.id)}
      className={cn(
        "group relative bg-white border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg",
        isSelected 
          ? "border-crimson bg-crimson/5 ring-4 ring-crimson/5" 
          : "border-gray-100 hover:border-sunny/30"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "p-3 rounded-xl transition-colors",
          isSelected ? "bg-crimson text-white" : "bg-gray-50 text-gray-400 group-hover:bg-sunny/10 group-hover:text-sunny"
        )}>
          <Target className="w-6 h-6" />
        </div>
        {isSelected && (
          <div className="bg-crimson text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
            Selected
          </div>
        )}
      </div>

      <h3 className={cn(
        "text-lg font-heading font-bold mb-2 transition-colors",
        isSelected ? "text-crimson" : "text-gray-900"
      )}>
        {template.title}
      </h3>
      
      <p className="text-sm text-gray-500 font-body line-clamp-2 mb-4">
        {template.description}
      </p>

      <div className="flex items-center gap-3">
        {template.discipline && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">
            <Lightbulb className="w-3 h-3" />
            {template.discipline}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">
          <BookOpen className="w-3 h-3" />
          {template.category}
        </div>
      </div>
    </div>
  );
}
