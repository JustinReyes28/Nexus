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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  const onPublish = async () => {
    try {
      setIsPublishing(true);
      const response = await fetch(`/api/projects/${projectId}/publish`, {
        method: "PATCH",
      });

      if (!response.ok) {
        // Read and parse the response body for more detailed error information
        let errorMessage = "Failed to publish draft";
        try {
          const errorBody = await response.json();
          errorMessage = errorBody.message || errorBody.error || JSON.stringify(errorBody);
        } catch (jsonError) {
          // Fallback to text if JSON parsing fails
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            // Use default message if both JSON and text parsing fail
          }
        }
        throw new Error(errorMessage);
      }

      toast.success("Draft published successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Read and parse the response body for more detailed error information
        let errorMessage = "Failed to delete draft";
        try {
          const errorBody = await response.json();
          errorMessage = errorBody.message || errorBody.error || JSON.stringify(errorBody);
        } catch (jsonError) {
          // Fallback to text if JSON parsing fails
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            // Use default message if both JSON and text parsing fail
          }
        }
        throw new Error(errorMessage);
      }

      toast.success("Draft deleted successfully.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowConfirmModal(false);
    }
  };

  const onDelete = async () => {
    setShowConfirmModal(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
  };

  return (
    <>
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
          aria-label={isDeleting ? "Deleting draft..." : "Delete draft"}
        >
          {isDeleting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Trash2 className="w-3 h-3" />
          )}
        </Button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            tabIndex={-1}
          >
            <h3 
              id="confirm-modal-title"
              className="text-lg font-medium text-gray-900 mb-2"
            >
              Delete Draft?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this draft? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
