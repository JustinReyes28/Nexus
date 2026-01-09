# Nexus - Visual Design Documentation

## Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Button Design](#button-design)
4. [Component Visual Styles](#component-visual-styles)
5. [Animations](#animations)
6. [Layout & Spacing](#layout--spacing)
7. [Visual Effects](#visual-effects)
8. [Responsive Design](#responsive-design)

## Color System

### Primary Color Palette

```css
--crimson: #b30909; /* Academic grounding, primary actions */
--sunny: #ffd166; /* Optimism, highlights, success states */
--teal: #06d6a0; /* AI elements, The Guide branding */
--canvas: #f8f9fa; /* Neutral background */
```

### Semantic Color Usage

```css
/* Primary Actions */
.primary-button {
  background-color: var(--crimson);
  color: white;
  border: 2px solid var(--crimson);
}

/* Secondary Actions */
.secondary-button {
  background-color: var(--sunny);
  color: #1f2937;
  border: 2px solid var(--sunny);
}

/* AI Elements */
.ai-button {
  background-color: var(--teal);
  color: white;
  border: 2px solid var(--teal);
  animation: pulse-organic 2s ease-in-out infinite;
}

/* Neutral Backgrounds */
.card-background {
  background-color: var(--canvas);
}

/* Text Colors */
.text-primary {
  color: var(--crimson);
}
.text-secondary {
  color: var(--sunny);
}
.text-ai {
  color: var(--teal);
}
```

## Typography

### Font Families

```css
:root {
  --font-heading: "Poppins", sans-serif;
  --font-body: "Inter", sans-serif;
  --font-handwritten: "Caveat", cursive;
}
```

### Font Usage Patterns

```css
/* Heading Styles */
.h1,
.h2,
.h3,
.h4,
.h5,
.h6 {
  font-family: var(--font-heading);
  font-weight: 700;
  line-height: 1.2;
}

/* Body Text */
body,
p,
li,
td,
th {
  font-family: var(--font-body);
  font-weight: 400;
  line-height: 1.6;
}

/* Handwritten Elements */
.handwritten {
  font-family: var(--font-handwritten);
  font-weight: 400;
  font-style: italic;
}

/* Specific Heading Sizes */
.h1 {
  font-size: 3rem;
}
.h2 {
  font-size: 2.25rem;
}
.h3 {
  font-size: 1.875rem;
}
.h4 {
  font-size: 1.5rem;
}
.h5 {
  font-size: 1.25rem;
}
.h6 {
  font-size: 1.125rem;
}
```

## Button Design

### Button Variants

```css
/* Base Button Styles */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-weight: 600;
  transition: all 200ms ease;
  border-radius: 8px;
  cursor: pointer;
}

/* Primary Button */
.button-primary {
  background-color: var(--crimson);
  color: white;
  border: 2px solid var(--crimson);
}

.button-primary:hover {
  background-color: #a00808; /* Darker crimson */
}

/* Secondary Button */
.button-secondary {
  background-color: var(--sunny);
  color: #1f2937;
  border: 2px solid var(--sunny);
}

.button-secondary:hover {
  background-color: #e6bf5d; /* Darker sunny */
}

/* AI Button */
.button-ai {
  background-color: var(--teal);
  color: white;
  border: 2px solid var(--teal);
  animation: pulse-organic 2s ease-in-out infinite;
}

.button-ai:hover {
  background-color: #05c290; /* Darker teal */
}

/* Outline Button */
.button-outline {
  background-color: transparent;
  color: var(--crimson);
  border: 2px solid var(--crimson);
}

.button-outline:hover {
  background-color: rgba(179, 9, 9, 0.05);
}

/* Ghost Button */
.button-ghost {
  background-color: transparent;
  color: #4b5563;
  border: none;
}

.button-ghost:hover {
  background-color: #f3f4f6;
}
```

### Button Sizes

```css
.button-sm {
  height: 36px;
  padding: 0 16px;
  font-size: 0.75rem;
  border-radius: 6px;
}

.button-md {
  height: 44px;
  padding: 0 24px;
  font-size: 0.875rem;
  border-radius: 8px;
}

.button-lg {
  height: 56px;
  padding: 0 40px;
  font-size: 1rem;
  border-radius: 12px;
}
```

## Component Visual Styles

### The Guide (AI Companion)

```css
.the-guide {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Background Aura */
.the-guide::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: rgba(6, 214, 160, 0.1);
  border-radius: 50%;
  filter: blur(24px);
  animation: pulse-organic 4s infinite;
}

/* Guide Body */
.the-guide-body {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--teal);
  border-radius: 40% 60% 40% 60% / 60% 40% 60% 40%;
  box-shadow: 0 10px 25px -5px rgba(6, 214, 160, 0.3), 0 8px 10px -6px rgba(6, 214, 160, 0.3);
  transition: all 700ms ease;
}

/* Eyes */
.the-guide-eyes {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 16px;
}

.the-guide-eye {
  width: 10px;
  height: 10px;
  background-color: white;
  border-radius: 50%;
  transition: all 300ms ease;
}

/* Thinking State */
.the-guide.thinking .the-guide-body {
  border-radius: 50%;
}

.the-guide.thinking .the-guide-eye {
  opacity: 0.3;
  transform: scaleX(1.5);
}

/* Celebrating State */
.the-guide.celebrating .the-guide-body {
  animation: bounce 1s infinite;
}
```

### Cards

```css
.card {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05);
  padding: 24px;
  transition: all 200ms ease;
}

.card:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  transform: translateY(-2px);
}

/* Project Card Specific */
.project-card {
  position: relative;
  overflow: hidden;
}

.project-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--crimson), var(--teal));
}
```

### Input Fields

```css
.input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1rem;
  transition: all 200ms ease;
}

.input:focus {
  outline: none;
  border-color: var(--teal);
  box-shadow: 0 0 0 3px rgba(6, 214, 160, 0.1);
}

.input::placeholder {
  color: #9ca3af;
}
```

## Animations

### Keyframe Animations

```css
@keyframes pulse-organic {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

@keyframes sparkle {
  0%,
  100% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1) rotate(90deg);
    opacity: 1;
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
```

### Animation Classes

```css
.animate-pulse-organic {
  animation: pulse-organic 2s ease-in-out infinite;
}

.animate-sparkle {
  animation: sparkle 0.5s ease-in-out forwards;
}

.animate-bounce {
  animation: bounce 1s infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
```

## Layout & Spacing

### Container System

```css
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 2rem;
  padding-right: 2rem;
}

@media (min-width: 1400px) {
  .container {
    max-width: 1400px;
  }
}
```

### Grid System

```css
/* Responsive Grid */
.grid {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Spacing Scale

```css
/* Padding and Margin Scale */
.p-6 {
  padding: 1.5rem;
}
.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}
.mt-12 {
  margin-top: 3rem;
}
.gap-4 {
  gap: 1rem;
}
.gap-6 {
  gap: 1.5rem;
}
.gap-8 {
  gap: 2rem;
}
```

## Visual Effects

### Background Textures

```css
.bg-grain {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.05;
}

.bg-paper {
  background-color: #f8f9fa;
  background-image: linear-gradient(
      90deg,
      rgba(179, 9, 9, 0.05) 1px,
      transparent 1px
    ), linear-gradient(rgba(179, 9, 9, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

### Shadows & Depth

```css
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.shadow-xl {
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}
```

### Borders

```css
.border {
  border-width: 1px;
  border-color: #e5e7eb;
}

.border-2 {
  border-width: 2px;
}

.border-crimson {
  border-color: var(--crimson);
}

.border-teal {
  border-color: var(--teal);
}

.rounded-lg {
  border-radius: 8px;
}

.rounded-xl {
  border-radius: 12px;
}
```

## Responsive Design

### Breakpoints

```css
/* Mobile-first breakpoints */
@media (min-width: 640px) {
  /* sm: */
}

@media (min-width: 768px) {
  /* md: */
}

@media (min-width: 1024px) {
  /* lg: */
}

@media (min-width: 1280px) {
  /* xl: */
}

@media (min-width: 1400px) {
  /* 2xl: */
}
```

### Responsive Patterns

```css
/* Mobile Navigation */
.nav-mobile {
  display: flex;
}

.nav-desktop {
  display: none;
}

@media (min-width: 768px) {
  .nav-mobile {
    display: none;
  }

  .nav-desktop {
    display: flex;
  }
}

/* Responsive Typography */
.text-xl {
  font-size: 1.25rem;
}

@media (min-width: 768px) {
  .text-xl {
    font-size: 1.5rem;
  }
}
```

This visual design documentation captures the literal design elements of Nexus, including CSS styles, button appearances, animations, and responsive patterns that create the "Collaborative Canvas" aesthetic.
