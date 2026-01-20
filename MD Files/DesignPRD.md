Design PRD: Nexus
Product Name: Nexus
Tagline: "Your AI-Powered Capstone Companion"
Design Theme: The Collaborative Canvas (Energetic, Human-Centric, Creative)
Version: 1.0

1. Executive Summary
   Nexus is an intelligent web platform serving as a comprehensive workspace for students undertaking capstone projects. It combines AI mentorship with project management and collaboration tools. The design will reflect a "Collaborative Canvas" aesthetic—mimicking the energy of a bustling digital campus library or maker space. It prioritizes organic shapes, vibrant academic colors, and a layout that emphasizes human connection supported by AI.
2. User Personas
   The Overwhelmed Student: An undergraduate feeling lost in the scope of their project. Needs structure, encouragement, and clear starting points.
   The Team Collaborator: A student working in a group who struggles with version control and uneven participation. Needs visibility on who is doing what.
   The Institutional Partner: Professors or admin looking for tools that actually help students succeed. Needs to see professionalism and academic rigor alongside the "fun" elements.
3. Design Principles
   Human-First, AI-Supported: The interface emphasizes the student and their team first. AI elements are visual "helpers" (accented in Teal), not the dominators of the experience.
   Organized Energy: The UI should feel vibrant and optimistic (Yellows) but grounded in academic seriousness (Crimson/Green). It creates a "focused flow" state.
   Base Camp Mentality: The dashboard is the central hub. Users should feel anchored there, with all tools reachable within one click.
4. Visual Identity System
   4.1 Color Palette
   Primary (Academic Grounding):
   #B30909 Academic Crimson (Use for Primary Buttons, Headers, Key Actions)
   Alternative: #2E8B57 Forest Green (Use for a calmer, research-heavy vibe or institutional contexts)
   Secondary (Optimism):
   #FFD166 Sunny Yellow (Use for notifications, highlights, success states, and hover effects)
   Accent (The AI):
   #06D6A0 Teal (Reserved strictly for AI elements: The Guide avatar, AI chat bubbles, AI-generated suggestions)
   Neutrals (The Canvas):
   #F8F9FA Off-White (Main background)
   #E9ECEF Light Gray (Card backgrounds, sidebars)
   4.2 Typography
   Headings: Bold, Modern Sans-Serif (e.g., Montserrat or Poppins). approachable but structured.
   H1: 36px, Weight: 700, Line-height: 1.2, Letter-spacing: -0.015em
   H2: 30px, Weight: 700, Line-height: 1.25, Letter-spacing: -0.01em
   H3: 24px, Weight: 700, Line-height: 1.3, Letter-spacing: -0.005em
   H4: 20px, Weight: 600, Line-height: 1.4, Letter-spacing: 0em
   H5: 18px, Weight: 600, Line-height: 1.4, Letter-spacing: 0.01em
   H6: 16px, Weight: 600, Line-height: 1.5, Letter-spacing: 0.02em
   Body Text: Clean Sans-Serif (e.g., Inter or Open Sans). High readability for long research documents.
   Body Large: 18px, Weight: 400, Line-height: 1.6, Letter-spacing: 0.005em
   Body Regular: 16px, Weight: 400, Line-height: 1.6, Letter-spacing: 0.01em
   Body Small/Caption: 14px, Weight: 400, Line-height: 1.5, Letter-spacing: 0.02em
   Lead Text: 20px, Weight: 400, Line-height: 1.5, Letter-spacing: 0.005em
   Bold Text: Weight: 600
   Semibold Text: Weight: 500
   Handwritten Elements: Script Font (e.g., Caveat). Used sparingly for "notes" on the collaborative canvas to feel like a whiteboard.
   Weight: 400, Max Size: 20px, Use for annotations and informal notes only
   Typography Usage Guidance:
   Use H1 for main page titles
   Use H2 for section headers
   Use H3 for subsections
   Use H4-H6 for nested content organization
   Use semibold for emphasis in navigation and key labels
   Use bold for strong emphasis and call-to-action text
   4.3 Responsive Design
   Breakpoint Definitions:
   Mobile: Up to 768px width
   Tablet: 769px to 1024px width
   Desktop: Above 1024px width
   Mobile Navigation Patterns:
   Hamburger Menu: Replaces left sidebar navigation on mobile, revealing "My Drafts, Research, Schedule" when activated
   Bottom Tab Bar: On mobile, critical navigation items appear in a persistent bottom tab bar
   Dashboard Adaptations:
   Stacked Layout: On mobile, "Project Feed" appears above both sidebars in a stacked arrangement
   Collapsed Sidebars: Left/right sidebars collapse into hamburger menus on mobile
   Persistent Bottom Sheet: Team Members + "The Guide" condensed into a persistent bottom sheet that can be expanded when needed
   Floating Action Button: Critical actions are promoted to a floating action button on mobile
   Touch Target Sizes:
   Minimum 48px for primary buttons and interactive elements
   Minimum 44px for secondary buttons and icons
   AI Triggers, buttons, and avatars must meet these minimums
   Consider 56px for critical actions like "Save" or "Submit"
   Gesture/Tap Behaviors:
   Tap-to-Open: Single tap opens comment threads and expands collapsed content
   Long-Press: Reveals context menus and shows cursor avatars with user information
   Swipe: Horizontal swipe navigates between project sections on mobile
   Pinch-to-Zoom: Allows zooming into project wall and detail views
   Layout Changes for Small Screens:
   Project Feed: Cards stack vertically with simplified headers and reduced padding
   Project Wall: Switches to a list view with expandable items instead of grid layout
   Collaboration Features: Comment threads appear as overlays instead of side panels
   Readability: Text scales appropriately with larger line heights for better readability on small screens
   Accessibility: All interactive elements maintain proper spacing and contrast ratios
5. Key Page Specifications
   5.1 Homepage
   Hero Section (Split Screen):
   Left: High-quality photography of a student in a "flow state" (cafe/library setting).
   Right: Abstract digital graphic showing nodes connecting (a mind map or neural network) representing the student's ideas expanding.
   Headline: "You're not alone on your capstone journey."
   Social Proof Strip:
   Greyscale logos of partner universities or student organizations running horizontally below the hero.
   Problem/Solution Grid:
   Design: A 2-column layout.
   Left (Problem): "Struggling with vague topics?" (Visual: A tangled knot icon).
   Right (Solution): "Nexus helps by brainstorming actionable research questions." (Visual: An organized flowchart icon in Teal).
   5.2 Feature: "Meet Your AI Companion"
   Visuals: Personify the AI as "The Guide." Use a friendly, non-robotic avatar (e.g., a geometric Teal abstract shape or a stylized mascot).
   UI Mockup: Display a chat interface floating over the page.
   Chat Bubble 1 (Student): "I'm stuck on my methodology."
   Chat Bubble 2 (The Guide - Teal): "Let's break it down. Are you leaning towards qualitative interviews or quantitative surveys? I can help you draft questions for both."
   5.3 Feature: "Built for Teams"
   Visuals: A mock-up of the "Collaboration Hub."
   Key Elements to Highlight:
   Cursor avatars with names attached (showing real-time collaboration).
   A comment thread on the side of a document.
   A distinctive "Project Wall" background (grid pattern or corkboard texture).
   5.4 The Dashboard (User Logged In)
   Concept: "Project Base Camp."
   Layout:
   Left Sidebar: Navigation (My Drafts, Research, Schedule).
   Right Sidebar: Team Members (Avatars with online status) + "The Guide" (AI) always accessible.
   Center Stage: The "Project Feed"—a chronological stream of updates ("Sarah edited the Intro," "Task 'Lit Review' due in 2 days").
   Visual Metaphor: Cards should look like they are pinned to a board.
6. UI Components & Interactions
   Buttons: Soft rounded corners (8px). Primary buttons have a solid Crimson fill. Secondary buttons are outlined.
   AI Triggers: Anywhere the AI can help (e.g., inside a text editor), use a subtle Teal Sparkle Icon. Clicking it expands the AI menu.
   Feedback Loops: When a task is marked "Complete," trigger a micro-interaction (e.g., a small burst of yellow confetti or a checkmark transforming into a star).
7. Accessibility Checklist
   Contrast: White text (#FFFFFF) on Teal (#06D6A0) has a contrast ratio of 3.93:1, which is insufficient for normal text (fails WCAG AA). For normal text, use #000000 (black) or a darker teal like #008B6D. For large text, this ratio meets WCAG AA standards. White text (#FFFFFF) on Yellow (#FFD166) has a contrast ratio of 1.64:1, which fails WCAG AA for both normal and large text. Use #000000 (black) text on yellow backgrounds to achieve 17.22:1 ratio meeting all WCAG standards.
   Alt Text: The abstract "neural network" graphics must have descriptive alt text for screen readers.
   Cognitive Load: Keep the "Dashboard" clean. Use whitespace effectively so the "vibrant" aesthetic doesn't become "cluttered."
   References
   [1] Academic research on student productivity tools
   [2] User persona studies in educational technology
   [3] Capstone project management best practices
   [4] UI/UX design principles for educational platforms
   [5] Team collaboration in academic settings
   [6] Real-time collaboration interface design
