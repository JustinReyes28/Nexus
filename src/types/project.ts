import { ProjectStatus } from "@prisma/client";

export interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  discipline: string | null;
  deadline: Date | string | null;
  status: ProjectStatus;
}