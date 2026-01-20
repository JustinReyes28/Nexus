"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Users, UserPlus, RefreshCw, X, Loader2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import InviteTeamMemberModal from "./InviteTeamMemberModal";
import { ProjectData } from "@/types/project";

interface TeamSectionProps {
  projectId: string;
  projectName: string;
  initialMembers: any[];
  initialInvitations: any[];
  isOwner: boolean;
}

export default function TeamSection({
  projectId,
  projectName,
  initialMembers,
  initialInvitations,
  isOwner,
}: TeamSectionProps) {
  const [members, setMembers] = useState(initialMembers);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/invitations`);
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations);
      }
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
    }
  };

  const handleResend = async (invitationId: string) => {
    try {
      setProcessingId(invitationId);
      const response = await fetch(`/api/projects/${projectId}/invitations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId }),
      });

      if (response.ok) {
        toast.success("Invitation resent successfully");
        fetchInvitations();
      } else {
        throw new Error("Failed to resend");
      }
    } catch (error) {
      toast.error("Failed to resend invitation");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (invitationId: string) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) return;

    try {
      setProcessingId(invitationId);
      const response = await fetch(`/api/projects/${projectId}/invitations`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId }),
      });

      if (response.ok) {
        toast.success("Invitation cancelled");
        fetchInvitations();
      } else {
        throw new Error("Failed to cancel");
      }
    } catch (error) {
      toast.error("Failed to cancel invitation");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Users className="w-4 h-4" />
          Collaborators
        </h3>
        {isOwner && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-teal hover:bg-teal/10 rounded-lg group"
            onClick={() => setIsInviteModalOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-1 transition-transform group-hover:scale-110" />
            Invite
          </Button>
        )}
      </div>

      <div className="divide-y divide-gray-50">
        {/* Active Members */}
        {members.map((member) => (
          <div key={member.id} className="p-4 flex items-center justify-between group hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal/10 to-teal/5 border border-teal/10 flex items-center justify-center overflow-hidden">
                {member.user.image ? (
                  <img src={member.user.image} alt={member.user.name || ""} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-extrabold text-teal">
                    {(member.user.name || member.user.email || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {member.user.name || member.user.email?.split("@")[0]}
                </p>
                <Badge variant={member.role === "OWNER" ? "primary" : "info"} className="mt-1">
                  {member.role}
                </Badge>
              </div>
            </div>
          </div>
        ))}

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <div className="bg-gray-50/30 p-4">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Pending Invitations
            </h4>
            <div className="space-y-3">
              {invitations.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between group">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 truncate">
                      {invite.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-medium text-gray-400 italic">
                        Expires {new Date(invite.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {isOwner && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleResend(invite.id)}
                        disabled={processingId === invite.id}
                        className="p-1.5 hover:bg-teal/10 rounded-lg text-teal transition-colors"
                        title="Resend Invitation"
                      >
                        {processingId === invite.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCancel(invite.id)}
                        disabled={processingId === invite.id}
                        className="p-1.5 hover:bg-crimson/10 rounded-lg text-crimson transition-colors"
                        title="Cancel Invitation"
                      >
                         <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <InviteTeamMemberModal
        projectId={projectId}
        projectName={projectName}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={fetchInvitations}
      />
    </section>
  );
}
