"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Sparkles, BookOpen, Target, Lightbulb, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createProject } from "@/lib/actions";
import SubmitButton from "@/app/(dashboard)/projects/new/SubmitButton";
import { TemplateSelector } from "@/components/templates/TemplateSelector";

export default function NewProjectForm() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [discipline, setDiscipline] = useState("");

  return (
    <form action={createProject} className="space-y-8">
      <input type="hidden" name="templateId" value={selectedTemplateId || ""} />
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="title" className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-crimson" />
            Project Title
          </Label>
          <Input
            id="title"
            name="title"
            type="text"
            required
            maxLength={150}
            placeholder="e.g., My Capstone Research Project"
            className="text-lg font-heading font-bold"
          />
          <p className="text-sm text-gray-500 mt-1 font-body">Give your project a clear, memorable name</p>
        </div>

        <div>
          <Label htmlFor="description" className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-teal" />
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            required
            maxLength={2000}
            placeholder="Describe your project's main goals and what you hope to achieve..."
            className="min-h-[120px] font-body"
          />
          <p className="text-sm text-gray-500 mt-1 font-body">Brief overview of your project's purpose</p>
        </div>

        <div>
          <Label htmlFor="discipline" className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-sunny" />
            Academic Discipline (Optional)
          </Label>
          <Input
            id="discipline"
            name="discipline"
            type="text"
            maxLength={100}
            placeholder="e.g., Computer Science, Engineering, Business"
            className="font-body"
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-1 font-body">What field of study does this project belong to?</p>
        </div>

        {/* Template Selector */}
        <div className="pt-4 border-t border-gray-100 font-body">
            <TemplateSelector 
                selectedTemplateId={selectedTemplateId} 
                onSelect={setSelectedTemplateId}
                discipline={discipline}
            />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t border-gray-100">
        <Link href="/dashboard">
          <Button type="button" variant="outline" className="w-full sm:w-auto">
            Cancel
          </Button>
        </Link>
        <SubmitButton />
      </div>
    </form>
  );
}
