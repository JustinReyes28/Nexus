import { ProjectData } from "@/types/project";

/**
 * Sanitizes ProjectData by removing PII (email addresses) from team members
 * to prevent exposure in public API responses or logs.
 */
export const sanitizeProjectData = (projectData: ProjectData): ProjectData => {
  return {
    ...projectData,
    team: projectData.team?.map(teamMember => ({
      ...teamMember,
      user: {
        ...teamMember.user,
        email: null // Remove email to prevent PII exposure
      }
    })),
// Keep other fields intact but ensure no PII is exposed
    invitations: projectData.invitations?.map(invitation => ({
      ...invitation,
      email: null, // Remove email to prevent PII exposure - preserved structure but sanitized content
    }))
  };
};

/**
 * Sanitizes an array of ProjectData objects
 */
export const sanitizeProjectDataArray = (projectsData: ProjectData[]): ProjectData[] => {
  return projectsData.map(sanitizeProjectData);
};