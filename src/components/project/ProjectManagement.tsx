// i will Review this later
"use client";

import React, { useState } from "react";
import ProjectActions from "./ProjectActions";
import EditProjectModal from "./EditProjectModal";
import { ProjectData } from "@/types/project";

interface ProjectManagementProps {
  project: ProjectData;
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
