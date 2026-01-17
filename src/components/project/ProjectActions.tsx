"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { 
  Pencil, 
  Trash2, 
  ListTodo, 
  Sparkles, 
  Loader2,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProjectStatus } from "@prisma/client";

interface ProjectActionsProps {
  projectId: string;
  status: ProjectStatus;
  onEdit: () => void;
}

export default function ProjectActions({ projectId, status, onEdit }: ProjectActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const router = useRouter();
  const isDraft = status === "IDEATION";

  const onDelete = async () => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone and will remove all associated tasks and data.")) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete project");

      toast.success("Project deleted successfully");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete project. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const onPublish = async () => {
    try {
      setIsPublishing(true);
      const response = await fetch(`/api/projects/${projectId}/publish`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Failed to publish project");

      toast.success("Project published successfully!");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to publish project. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="bg-canvas border-2 border-dashed border-gray-100 rounded-2xl p-6 h-full flex flex-col justify-between">
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          Management Console
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          <Link href={`/projects/${projectId}/tasks`}>
            <Button variant="primary" className="w-full justify-start gap-3 h-12 rotate-1 hover:rotate-0">
               <ListTodo className="w-5 h-5" />
               View Task Board
               <ExternalLink className="w-4 h-4 ml-auto opacity-50" />
            </Button>
          </Link>

          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-12"
            onClick={onEdit}
          >
             <Pencil className="w-5 h-5" />
             Edit Details
          </Button>

          {isDraft && (
            <Button 
              variant="ai" 
              className="w-full justify-start gap-3 h-12 -rotate-1 hover:rotate-0"
              onClick={onPublish}
              disabled={isPublishing}
            >
               {isPublishing ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
               ) : (
                 <Sparkles className="w-5 h-5" />
               )}
               {isPublishing ? "Publishing..." : "Launch Project"}
            </Button>
          )}
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-gray-100 border-dashed">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-10 text-gray-400 hover:text-crimson hover:bg-crimson/5 rounded-lg"
          onClick={onDelete}
          disabled={isDeleting}
        >
           {isDeleting ? (
             <Loader2 className="w-4 h-4 animate-spin" />
           ) : (
             <Trash2 className="w-4 h-4" />
           )}
           {isDeleting ? "Deleting..." : "Delete Project Permanently"}
        </Button>
      </div>
    </div>
  );
}
