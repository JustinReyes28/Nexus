"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Sparkles, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DraftActionsProps {
  projectId: string;
}

export default function DraftActions({ projectId }: DraftActionsProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const onPublish = async () => {
    try {
      setIsPublishing(true);
      const response = await fetch(`/api/projects/${projectId}/publish`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to publish draft");
      }

      toast.success("Draft published successfully!");
      router.refresh();
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("Are you sure you want to delete this draft? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete draft");
      }

      toast.success("Draft deleted successfully.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <Button 
        variant="ai" 
        size="sm" 
        className="flex-1 py-1 h-8 text-[11px]" 
        onClick={onPublish}
        disabled={isPublishing || isDeleting}
      >
        {isPublishing ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <>
            <Sparkles className="w-3 h-3 mr-1" />
            Publish Draft
          </>
        )}
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8 px-2 text-gray-400 hover:text-crimson hover:bg-crimson/5 border-gray-200"
        onClick={onDelete}
        disabled={isPublishing || isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Trash2 className="w-3 h-3" />
        )}
      </Button>
    </div>
  );
}
