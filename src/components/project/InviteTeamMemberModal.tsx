"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { X, UserPlus, Mail, Loader2, ShieldCheck, User, Eye } from "lucide-react";
import { toast } from "sonner";

interface InviteTeamMemberModalProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type TeamRole = "ADMIN" | "MEMBER" | "VIEWER";

const ROLES: { value: TeamRole; label: string; description: string; icon: any }[] = [
  {
    value: "ADMIN",
    label: "Admin",
    description: "Can manage tasks, documents and invite others.",
    icon: ShieldCheck,
  },
  {
    value: "MEMBER",
    label: "Member",
    description: "Can create and edit tasks and documents.",
    icon: User,
  },
  {
    value: "VIEWER",
    label: "Viewer",
    description: "Can only view project content.",
    icon: Eye,
  },
];

export default function InviteTeamMemberModal({
  projectId,
  projectName,
  isOpen,
  onClose,
  onSuccess,
}: InviteTeamMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("MEMBER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      document.body.style.overflow = "unset";
      setEmail("");
      setRole("MEMBER");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/email/send-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          email,
          role,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to send invitation";
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || errorMessage;
        } catch (jsonError) {
          // If JSON parsing fails, fall back to text
          const text = await response.text();
          errorMessage = text || response.statusText || errorMessage;
        }
        throw new Error(
          `HTTP ${response.status}: ${errorMessage}`
        );
      }

      toast.success(`Invitation sent to ${email}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error("[INVITE_SUBMIT_ERROR]", error);
      toast.error(error.message || "Failed to send invitation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  const handleTabNavigation = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div
        ref={modalRef}
        tabIndex={-1}
        onKeyDown={handleTabNavigation}
        className="bg-canvas w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-4 border-white relative focus:outline-none"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal via-sunny to-crimson" />

        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal/10 rounded-2xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-teal" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-extrabold text-gray-900 leading-tight">
                  Invite Contributor
                </h2>
                <p className="text-sm text-gray-400 font-medium">
                  {projectName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-crimson transition-colors" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                Colleague Email
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-300 group-focus-within:text-teal transition-colors" />
                </div>
                <Input
                  className="pl-12 h-14 bg-gray-50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-teal/10 transition-all rounded-2xl text-lg"
                  placeholder="Enter colleague's email..."
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                Assign Role
              </Label>
              <div className="grid grid-cols-1 gap-3">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const isSelected = role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-teal bg-teal/5 shadow-md shadow-teal/5"
                          : "border-gray-50 hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected ? "bg-teal text-white" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-bold text-sm ${
                            isSelected ? "text-teal" : "text-gray-700"
                          }`}
                        >
                          {r.label}
                        </p>
                
