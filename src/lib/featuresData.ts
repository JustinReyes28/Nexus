import {
  BookOpen,
  PenTool,
  Compass,
  TrendingUp,
  Users,
  CheckSquare,
  MessageCircle,
  GitBranch,
  Calendar,
  Clock,
  BarChart,
  FileText,
  Quote,
  Network,
  StickyNote,
  Layout,
  LucideIcon
} from "lucide-react";
import { FeatureVariant } from "./featureColors";

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  variant: FeatureVariant;
}

export const features: Feature[] = [
  // AI-Powered Mentorship
  {
    id: "ai-research",
    title: "Smart Source Discovery",
    description: "AI-powered search through academic databases with relevance scoring and citation quality indicators.",
    icon: BookOpen,
    variant: "ai",
  },
  {
    id: "ai-writing",
    title: "Structure Your Thoughts",
    description: "Real-time suggestions for improving clarity, flow, and academic rigor in your writing.",
    icon: PenTool,
    variant: "ai",
  },
  {
    id: "ai-methodology",
    title: "Research Design Made Simple",
    description: "Step-by-step guidance for choosing and implementing research methods appropriate to your field.",
    icon: Compass,
    variant: "ai",
  },
  {
    id: "ai-progress",
    title: "Never Lose Momentum",
    description: "Intelligent nudges and milestone suggestions to keep your project on track.",
    icon: TrendingUp,
    variant: "ai",
  },
  
  // Team Collaboration
  {
    id: "collab-workspace",
    title: "Your Digital Campus",
    description: "Real-time collaborative environment where team members can work simultaneously on shared documents.",
    icon: Users,
    variant: "collaboration",
  },
  {
    id: "collab-tasks",
    title: "Who Does What",
    description: "Clear task assignment with progress tracking, dependencies, and automatic workload balancing.",
    icon: CheckSquare,
    variant: "collaboration",
  },
  {
    id: "collab-comm",
    title: "Stay in Sync",
    description: "Integrated messaging, comments, and mentions that keep everyone aligned without leaving the platform.",
    icon: MessageCircle,
    variant: "collaboration",
  },
  {
    id: "collab-version",
    title: "No More Version Chaos",
    description: "Automatic version history with diff visualization and the ability to restore previous states.",
    icon: GitBranch,
    variant: "collaboration",
  },

  // Project Management
  {
    id: "mgmt-timeline",
    title: "See the Big Picture",
    description: "Gantt charts and timeline views that make project milestones and dependencies visually clear.",
    icon: Calendar,
    variant: "management",
  },
  {
    id: "mgmt-deadlines",
    title: "Never Miss a Deadline",
    description: "Smart deadline management with automated reminders and escalation workflows.",
    icon: Clock,
    variant: "management",
  },
  {
    id: "mgmt-analytics",
    title: "Know Where You Stand",
    description: "Visual progress tracking with insights into team velocity and individual contributions.",
    icon: BarChart,
    variant: "management",
  },
  {
    id: "mgmt-templates",
    title: "Start Strong",
    description: "Pre-built templates for common capstone project structures across different disciplines.",
    icon: Layout,
    variant: "management",
  },

  // Research Tools
  {
    id: "research-citation",
    title: "Perfect Citations Every Time",
    description: "Automatic citation generation in APA, MLA, Chicago, and Harvard formats from DOI or URL.",
    icon: Quote,
    variant: "research",
  },
  {
    id: "research-pdf",
    title: "Organize Your Sources",
    description: "Built-in PDF viewer with annotation, highlighting, and organizational tools.",
    icon: FileText,
    variant: "research",
  },
  {
    id: "research-mapping",
    title: "See the Connections",
    description: "Visual network diagrams showing relationships between sources and research themes.",
    icon: Network,
    variant: "research",
  },
  {
    id: "research-notes",
    title: "Capture Every Insight",
    description: "Rich text notes linked to sources with powerful search and organization capabilities.",
    icon: StickyNote,
    variant: "research",
  },
];
