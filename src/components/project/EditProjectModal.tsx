// i will Review this later
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { X, Target, BookOpen, Lightbulb, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ProjectData } from "@/types/project";
import { ProjectStatus } from "@prisma/client";

interface EditProjectModalProps {
  project: ProjectData;
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to format date for input field using local time
const formatDateForInput = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export default function EditProjectModal({ project, isOpen, onClose }: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || "",
    discipline: project.discipline || "",
    deadline: project.deadline ? formatDateForInput(project.deadline) : "",
    status: project.status,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Update form state when project prop changes
  useEffect(() => {
    setFormData({
      title: project.title,
      description: project.description || "",
      discipline: project.discipline || "",
      deadline: project.deadline ? formatDateForInput(project.deadline) : "",
      status: project.status,
    });
  }, [project]);

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus management and keyboard accessibility
  useEffect(() => {
    if (isOpen) {
      // Save the currently focused element to restore later
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Set initial focus to the modal container
      if (modalRef.current) {
        modalRef.current.focus();
      }

      // Add keydown event listener for Escape key
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      // Add focus trap using keyboard events for tab navigation
      const handleTabNavigation = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          // Get all focusable elements inside the modal
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as NodeListOf<HTMLElement>;
          
          if (focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keydown", handleTabNavigation);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keydown", handleTabNavigation);
        
        // Restore focus to the previously active element when closing
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

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

      if (!response.ok) {
        let errorMessage = "Failed to update project. Please try again.";
        try {
          // Try parsing JSON error response first
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } catch (jsonError) {
          // If JSON parsing fails, try text response
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText;
            }
          } catch (textError) {
            // If both JSON and text parsing fail, keep the generic message
          }
        }
        
        console.error(`Update failed: ${errorMessage}`);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      toast.success("Project updated successfully");
      router.refresh();
      onClose();
    } catch (error) {
      // Error is already handled above, but this catches any other errors
      if (error instanceof Error && !error.message.includes("Failed to update project")) {
        console.error(error);
        toast.error(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border-2 border-gray-100 flex flex-col max-h-[90vh]"
      >
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
                    {Object.values(ProjectStatus)
                      .filter(status => status !== "IDEATION")
                      .map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                        </option>
                      ))}
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
