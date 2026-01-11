export const featureColors = {
  ai: {
    icon: "text-teal",
    background: "bg-teal/10",
    border: "border-teal/20",
    hover: "hover:bg-teal/15",
    button: "bg-teal hover:bg-teal/90",
  },
  collaboration: {
    icon: "text-crimson",
    background: "bg-crimson/5",
    border: "border-crimson/15",
    hover: "hover:bg-crimson/10",
    button: "bg-crimson hover:bg-crimson/90",
  },
  management: {
    icon: "text-sunny",
    background: "bg-sunny/15",
    border: "border-sunny/30",
    hover: "hover:bg-sunny/25",
    button: "bg-sunny hover:bg-sunny/90",
  },
  research: {
    icon: "text-indigo-600",
    background: "bg-indigo-50",
    border: "border-indigo-100",
    hover: "hover:bg-indigo-100/50",
    button: "bg-indigo-600 hover:bg-indigo-700",
  },
} as const;

export type FeatureVariant = keyof typeof featureColors;
