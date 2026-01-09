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
    icon: "text-gray-600",
    background: "bg-gray-100",
    border: "border-gray-200",
    hover: "hover:bg-gray-50",
    button: "bg-gray-600 hover:bg-gray-700",
  },
} as const;

export type FeatureVariant = keyof typeof featureColors;
