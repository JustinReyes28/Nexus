export interface QuickTip {
  title: string;
  text: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  color: string;
}

export interface ProjectExample {
  name: string;
  color: string;
}

export interface DashboardEmptyStateConfig {
  tips: QuickTip[];
  templates: ProjectTemplate[];
  examples: ProjectExample[];
  tutorialLink: string;
}

export const DEFAULT_EMPTY_STATE_CONFIG: DashboardEmptyStateConfig = {
  tips: [
    { title: "Define", text: "Start with your main research question" },
    { title: "Breakdown", text: "Split project into 3-5 key milestones" },
    { title: "Ask AI", text: "Use the assistant for topic ideas" },
  ],
  templates: [
    { id: "research-paper", name: "Research Paper", color: "crimson" },
    { id: "thesis", name: "Full Thesis", color: "sunny" },
    { id: "presentation", name: "Presentation", color: "teal" },
  ],
  examples: [
    { name: "Machine Learning Research", color: "bg-crimson" },
    { name: "Literature Review", color: "bg-sunny" },
    { name: "Experimental Study", color: "bg-teal" },
    { name: "Case Study Analysis", color: "bg-purple-500" },
  ],
  tutorialLink: "https://example.com/tutorial",
};
