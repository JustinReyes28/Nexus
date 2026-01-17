"use client";

import React, { useState } from "react";
import ProjectActions from "./ProjectActions";
import EditProjectModal from "./EditProjectModal";
import { ProjectStatus } from "@prisma/client";

interface ProjectManagementProps {
  project: {
    id: string;
    title: string;
    description: string | null;
    discipline: string | null;
    deadline: Date | string | null;
    status: ProjectStatus;
  };
}

export default function ProjectManagement({ project }: ProjectManagementProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <ProjectActions 
        projectId={project.id} 
        status={project.status} 
        onEdit={() => setIsEditModalOpen(true)} 
      />
      <EditProjectModal 
        project={project} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    </>
  );
}
