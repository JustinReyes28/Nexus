export const featureColors = {
  ai: {
    icon: "text-teal",
    background: "bg-teal/10",
    border: "border-teal/20",
    hover: "hover:bg-teal/15",
    button: "bg-teal hover:bg-teal/90",
    glow: "bg-teal/5",
  },
  collaboration: {
    icon: "text-crimson",
    background: "bg-crimson/5",
    border: "border-crimson/15",
    hover: "hover:bg-crimson/10",
    button: "bg-crimson hover:bg-crimson/90",
    glow: "bg-crimson/5",
  },
  management: {
    icon: "text-sunny",
    background: "bg-sunny/15",
    border: "border-sunny/30",
    hover: "hover:bg-sunny/25",
    button: "bg-sunny hover:bg-sunny/90",
    glow: "bg-sunny/5",
  },
  research: {
    icon: "text-indigo",
    background: "bg-indigo/10",
    border: "border-indigo/20",
    hover: "hover:bg-indigo/15",
    button: "bg-indigo hover:bg-indigo/90",
    glow: "bg-indigo/5",
  },
} as const;

export type FeatureVariant = keyof typeof featureColors;
