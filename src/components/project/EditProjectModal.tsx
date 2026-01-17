"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { X, Target, BookOpen, Lightbulb, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ProjectStatus } from "@prisma/client";

interface EditProjectModalProps {
  project: {
    id: string;
    title: string;
    description: string | null;
    discipline: string | null;
    deadline: Date | string | null;
    status: ProjectStatus;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProjectModal({ project, isOpen, onClose }: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || "",
    discipline: project.discipline || "",
    deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : "",
    status: project.status,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          deadline: formData.deadline || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to update project");

      toast.success("Project updated successfully");
      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border-2 border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b-2 border-gray-100 border-dashed flex items-center justify-between bg-paper">
          <div>
            <h2 className="text-2xl font-heading font-extrabold text-gray-900">Edit Project Details</h2>
            <p className="text-sm text-gray-500 font-body italic mt-1">Refining the blueprint of your success.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto">
          <form id="edit-project-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="title" className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-crimson" />
                  Project Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., My Capstone Research Project"
                  className="text-lg font-heading font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description" className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-teal" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project's main goals..."
                  className="min-h-[100px] font-body"
                />
              </div>

              <div>
                <Label htmlFor="discipline" className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-sunny" />
                  Discipline
                </Label>
                <Input
                  id="discipline"
                  value={formData.discipline}
                  onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                  placeholder="e.g., Computer Science"
                  className="font-body"
                />
              </div>

              <div>
                <Label htmlFor="deadline" className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-crimson" />
                  Deadline
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="font-body"
                />
              </div>
              
              {project.status !== "IDEATION" && (
                <div className="md:col-span-2">
                   <Label htmlFor="status" className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-teal" />
                    Status
                  </Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    className="w-full h-11 px-4 rounded-[8px] border-2 border-gray-100 bg-white font-body text-sm outline-none focus:ring-2 focus:ring-crimson/10 transition-all cursor-pointer"
                  >
                    <option value="PROPOSAL">Proposal</option>
                    <option value="RESEARCH">Research</option>
                    <option value="DEVELOPMENT">Development</option>
                    <option value="WRITING">Writing</option>
                    <option value="REVIEW">Review</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t-2 border-gray-100 border-dashed bg-gray-50 flex flex-col sm:flex-row gap-4 justify-end">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="edit-project-form"
            className="w-full sm:w-auto shadow-lg shadow-crimson/10 rotate-1 hover:rotate-0"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
