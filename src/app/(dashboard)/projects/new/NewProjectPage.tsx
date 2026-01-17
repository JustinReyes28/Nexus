"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { WavyUnderline } from "@/components/ui/HandDrawnElements";
import { Sparkles, ArrowLeft, BookOpen, Target, Lightbulb, Calendar, Flag } from "lucide-react";
import Link from "next/link";
import { createProject } from "@/lib/actions";
import { ProjectStatus } from "@prisma/client";

interface NewProjectPageProps {
  session: {
    user: {
      id: string;
    };
  };
}

export default function NewProjectPage({ session }: NewProjectPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discipline: "",
    status: ProjectStatus.IDEATION,
    startDate: "",
    deadline: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Client-side validation
    if (!formData.title || !formData.description) {
      setError("Title and description are required");
      setIsLoading(false);
      return;
    }

    // Date validation
    if (formData.startDate && formData.deadline) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.deadline);
      if (end <= start) {
        setError("Deadline must be after start date");
        setIsLoading(false);
        return;
      }
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      if (formData.discipline) formDataToSend.append("discipline", formData.discipline);
      formDataToSend.append("status", formData.status);
      if (formData.startDate) formDataToSend.append("startDate", formData.startDate);
      if (formData.deadline) formDataToSend.append("deadline", formData.deadline);
      formDataToSend.append("userId", session.user.id);

      await createProject(formDataToSend);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project. Please try again.");
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b-2 border-gray-100 border-dashed">
        <div>
          <div className="flex items-center gap-2 text-sunny font-handwritten text-xl mb-1">
            <Sparkles className="w-5 h-5" />
            Time to Create Something Amazing!
          </div>
          <h1 className="text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 tracking-tight relative inline-block">
            Launch Your Next Project
            <WavyUnderline className="text-crimson/20" />
          </h1>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Form Container */}
      <div className="bg-canvas border-2 border-sunny/20 rounded-[32px] p-8 shadow-xl shadow-sunny/10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-sunny/5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-crimson/5 rounded-full pointer-events-none" />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-body mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10 space-y-8 max-w-2xl mx-auto">
          <input type="hidden" name="userId" value={session.user.id} />
          
          <div className="space-y-8">
            {/* Project Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <Target className="w-3 h-3 text-crimson" />
                Project Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="What's your project called?"
                className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 focus:ring-4 focus:ring-crimson/5 outline-none transition-all font-body text-gray-800 placeholder:text-gray-300 text-lg font-heading font-bold"
                value={formData.title}
                onChange={handleInputChange}
              />
              <p className="text-sm text-gray-500 font-body">Give your project a clear, memorable name</p>
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <BookOpen className="w-3 h-3 text-teal" />
                Project Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                placeholder="Describe your project goals, scope, and key objectives..."
                className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 focus:ring-4 focus:ring-crimson/5 outline-none transition-all font-body text-gray-800 placeholder:text-gray-300 resize-none min-h-[120px]"
                value={formData.description}
                onChange={handleInputChange}
              />
              <p className="text-sm text-gray-500 font-body">Brief overview of your project's purpose</p>
            </div>

            {/* Academic Discipline */}
            <div className="space-y-2">
              <label htmlFor="discipline" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <Lightbulb className="w-3 h-3 text-sunny" />
                Academic Discipline
              </label>
              <select
                id="discipline"
                name="discipline"
                className="w-full pl-5 pr-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 outline-none transition-all font-body text-gray-800 appearance-none cursor-pointer"
                value={formData.discipline}
                onChange={handleInputChange}
              >
                <option value="">Select your field of study</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
                <option value="Humanities">Humanities</option>
                <option value="Natural Sciences">Natural Sciences</option>
                <option value="Social Sciences">Social Sciences</option>
                <option value="Arts">Arts</option>
                <option value="Health Sciences">Health Sciences</option>
              </select>
              <p className="text-sm text-gray-500 font-body">What field of study does this project belong to?</p>
            </div>

            {/* Project Status */}
            <div className="space-y-2">
              <label htmlFor="status" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <Flag className="w-3 h-3 text-crimson" />
                Project Status
              </label>
              <select
                id="status"
                name="status"
                className="w-full pl-5 pr-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 outline-none transition-all font-body text-gray-800 appearance-none cursor-pointer"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value={ProjectStatus.IDEATION}>Ideation</option>
                <option value={ProjectStatus.PROPOSAL}>Proposal</option>
                <option value={ProjectStatus.RESEARCH}>Research</option>
                <option value={ProjectStatus.DEVELOPMENT}>Development</option>
                <option value={ProjectStatus.WRITING}>Writing</option>
                <option value={ProjectStatus.REVIEW}>Review</option>
                <option value={ProjectStatus.COMPLETED}>Completed</option>
              </select>
            </div>

            {/* Date Range Picker */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="startDate" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-teal" />
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="w-full pl-5 pr-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 outline-none transition-all font-body text-gray-800"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="deadline" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-crimson" />
                  Deadline
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  className="w-full pl-5 pr-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 outline-none transition-all font-body text-gray-800"
                  value={formData.deadline}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t border-gray-100">
            <Link href="/dashboard">
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="w-full sm:w-auto shadow-lg shadow-crimson/10 rotate-1 hover:rotate-0"
              disabled={isLoading}
              isLoading={isLoading}
            >
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
