// i will Review this later
"use client";

import React, { useState } from "react";
import ProjectActions from "./ProjectActions";
import EditProjectModal from "./EditProjectModal";
import InviteTeamMemberModal from "./InviteTeamMemberModal";
import { ProjectData } from "@/types/project";

interface ProjectManagementProps {
  project: ProjectData;
}

export default function ProjectManagement({ project }: ProjectManagementProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  return (
    <>
      <ProjectActions 
        projectId={project.id} 
        status={project.status} 
        onEdit={() => setIsEditModalOpen(true)} 
        onInvite={project.ownerId ? () => setIsInviteModalOpen(true) : undefined}
      />
      <EditProjectModal 
        project={project} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
      <InviteTeamMemberModal
        projectId={project.id}
        projectName={project.title}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </>
  );
}
