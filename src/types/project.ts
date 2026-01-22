import { ProjectStatus } from "@prisma/client";

// NOTE: This interface contains PII (email addresses) in the team[].user.email field
// When serializing to JSON responses or logs, use sanitizeProjectData() to remove PII
export interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  discipline: string | null;
  deadline: Date | string | null;
  status: ProjectStatus;
  ownerId: string;
  team?: {
    id: string;
    role: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;  // Contains PII - sanitize before exposing publicly
      image: string | null;
    };
  }[];
  invitations?: {
    id: string;
    email: string;
    role?: string;
    status?: string;
    expiresAt: Date | string;
    createdAt: Date | string;
  }[];
}