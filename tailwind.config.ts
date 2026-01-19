import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        crimson: "#B30909",
        sunny: "#FFD166",
        teal: "#14B8A6",
        indigo: "#6366F1",
        canvas: "#F8F9FA",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        handwritten: ["var(--font-handwritten)", "cursive"],
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
        "xl": "12px",
        "2xl": "16px",
      },
      spacing: {
        "14": "3.5rem",
        "18": "4.5rem",
        "22": "5.5rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "bounce-slow": {
          "0%": { transform: "translateY(0)" },
          "25%": { transform: "translateY(-5px)" },
          "50%": { transform: "translateY(0)" },
          "75%": { transform: "translateY(-3px)" },
          "100%": { transform: "translateY(0)" },
        },
        "pulse-organic": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.8" },
        },
        "sparkle": {
          "0%, 100%": { transform: "scale(0) rotate(0deg)", opacity: "0" },
          "50%": { transform: "scale(1) rotate(90deg)", opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        "draw": {
          "0%": { strokeDashoffset: "300" },
          "100%": { strokeDashoffset: "0" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "bounce-slow": "bounce-slow 8s ease-in-out infinite",
        "pulse-organic": "pulse-organic 2s ease-in-out infinite",
        "sparkle": "sparkle 0.5s ease-in-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease forwards",
        "bounce-subtle": "bounce-subtle 1s infinite",
        "draw": "draw 1s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
