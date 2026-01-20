import { ProjectStatus } from "@prisma/client";

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
      email: string | null;
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