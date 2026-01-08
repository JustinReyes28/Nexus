# Product Requirements Document: Nexus

## 1. Product Overview

**Product Name:** Nexus  
**Tagline:** "Your AI-Powered Capstone Companion"

**Vision Statement:**  
Nexus is an intelligent web platform designed to guide students through every stage of their capstone projects—from ideation to completion. By leveraging AI capabilities, Nexus provides personalized mentorship, research assistance, project management tools, and collaborative features to help students successfully navigate one of their most challenging academic milestones.

**Target Audience:**

- Undergraduate and graduate students working on capstone projects
- Academic institutions looking for student success tools
- Student groups collaborating on team-based capstones

---

## 2. Core Problem Statement

Students face numerous challenges during capstone projects including unclear requirements, difficulty generating viable ideas, lack of structured guidance, research overload, poor time management, and limited access to mentorship. Nexus addresses these pain points through AI-assisted guidance and comprehensive project management tools.

---

## 3. Key Features & Functional Requirements

### 3.1 AI-Powered Features (Google AI Studio API)

**Idea Generator & Validator**

- Students input their field of study, interests, and constraints
- AI generates multiple capstone project ideas with feasibility scores
- Validates ideas against academic rigor, scope, and available resources
- Provides pros/cons analysis for each suggested topic

**Research Assistant**

- AI-powered literature review suggestions
- Summarizes key concepts and methodologies
- Generates research questions and hypotheses
- Identifies gaps in existing research
- Citation format assistance

**Proposal Writer**

- Interactive proposal builder with AI suggestions
- Section-by-section guidance with best practices
- Real-time feedback on clarity, structure, and academic tone
- Template library for different disciplines

**Methodology Advisor**

- Recommends appropriate research methodologies
- Suggests data collection and analysis approaches
- Identifies potential limitations and mitigation strategies

**Progress Analyzer**

- Reviews project status and identifies bottlenecks
- Suggests next steps based on current progress
- Risk assessment and deadline feasibility checks

**Writing Assistant**

- Grammar and style improvements
- Academic tone enhancement
- Plagiarism risk flagging with rewriting suggestions
- Chapter/section coherence analysis

### 3.2 Project Management

**Dashboard**

- Visual progress tracking with milestones
- Timeline view with deadline countdowns
- Task completion percentage
- Recent activity feed
- Quick access to AI tools

**Task & Milestone Manager**

- Customizable project phases and tasks
- Gantt chart visualization
- Deadline reminders via email (Google SMTP + Nodemailer)
- Task dependencies and critical path highlighting
- Status tracking with custom tags

**Document Repository**

- Version-controlled document storage
- Organized folders by project phase
- Draft history with comparison tools
- Export capabilities for various formats

### 3.3 Collaboration Features

**Team Workspaces**

- Shared project spaces for group capstones
- Role-based permissions for team members
- Collaborative document editing indicators
- Team chat and discussion threads
- Task assignment and accountability tracking

**Advisor Communication**

- Structured feedback request system
- Meeting notes and action items
- Progress report generation for advisors
- Comment threads on specific project sections

### 3.4 Resource Library

**Template Center**

- Proposal templates by discipline
- Presentation slide decks
- Research methodology frameworks
- Defense preparation guides

**Knowledge Base**

- Best practices articles
- Video tutorials
- Sample successful capstone projects (anonymized)
- Common pitfalls and how to avoid them

### 3.5 User Management & Authentication

**Authentication (NextAuth.js)**

- Email/password registration and login
- Google OAuth integration
- Password reset via email
- Code Based Email verification for new accounts
- Session management with secure tokens

**User Profiles**

- Academic information (institution, program, year)
- Project details and focus areas
- Progress statistics and achievements
- Preference settings for AI assistance level

**Role Management**

- Student accounts (free tier with usage limits)
- Premium student accounts (expanded AI credits)
- Advisor/mentor accounts (view-only or collaborative access)
- Admin accounts for institutional deployments

---

## 4. Technical Architecture

### 4.1 Frontend Stack

**Framework & Language**

- Next.js (App Router for modern routing and server components)
- React 18+ for UI components
- TypeScript for type safety and better developer experience

**Styling**

- Tailwind CSS for utility-first responsive design
- Custom design system with consistent color palette and components
- Dark mode support

**Data Management**

- TanStack Query (React Query) for server state management, caching, and optimistic updates
- Zod for runtime type validation and form schemas
- Local state management with React hooks

### 4.2 Backend Stack

**API Layer**

- Next.js API Routes for RESTful endpoints
- Server Actions for form submissions and mutations
- Middleware for authentication and rate limiting

**Database**

- MongoDB for flexible document storage
- Prisma ORM for type-safe database queries
- Collections: Users, Projects, Tasks, Documents, Conversations, Templates

data for AI API calls

**External Services**

- Google AI Studio API for all AI features
- Google SMTP + Nodemailer for transactional emails
- Vercel Blob Storage for document uploads (within free tier limits)

### 4.3 Key Technical Flows

**AI Interaction Pattern**

1. User submits request through form (validated with Zod)
2. Request cached check via Upstash to prevent duplicate processing
3. Server Action sends prompt to Google AI Studio API
4. Response streamed back to client with loading states
5. Result cached and stored in MongoDB for history
6. Usage tracked against user quotas

**Authentication Flow**

1. NextAuth.js handles OAuth and credential providers
2. Session stored in Upstash Redis for fast access
3. JWT tokens for stateless authentication
4. Protected routes with middleware checks

**Document Management**

1. File upload with client-side validation
2. Server-side processing and virus scanning consideration
3. Metadata stored in MongoDB, files in Vercel Blob
4. Version tracking with timestamps and user attribution

---

## 5. Data Models (Prisma Schema Concepts)

**User Model**

- Authentication credentials and OAuth data
- Profile information and preferences
- Subscription tier and AI usage quotas
- Created/updated timestamps

**Project Model**

- Project metadata, title, description, and discipline
- Status tracking and deadline information
- Associated user/team members
- Phase and milestone definitions

**Task Model**

- Task details, status, and priority
- Assigned users and due dates
- Parent project reference
- Completion tracking

**Document Model**

- File metadata and storage references
- Version history
- Access permissions
- Associated project

**AIConversation Model**

- User prompts and AI responses
- Feature type categorization
- Token usage tracking
- Timestamp and project association

**Template Model**

- Template content and metadata
- Category and discipline tags
- Usage statistics

---

## 6. AI Feature Implementation Details

### 6.1 Prompt Engineering Strategy

**System Prompts by Feature**

- Each AI feature has specialized system prompts tailored to academic contexts
- Prompts include constraints around academic integrity, citation requirements, and appropriate scope
- Temperature and parameter tuning per feature type

**Context Management**

- Include relevant project metadata in prompts for personalized responses
- Conversation history for follow-up questions
- Token budget management to stay within API limits

### 6.2 Response Processing

**Streaming Responses**

- Real-time streaming for better UX on longer generations
- Incremental rendering of AI output
- Cancel capability for long-running requests

**Output Validation**

- Zod schemas for expected AI response structures
- Fallback handling for unexpected formats
- Content moderation checks

### 6.3 Usage Limits & Quotas

**Free Tier Limits**

- Credit Based Limit (100 Credits per Month per Free Tier user)
- Document storage limit
- Cached response prioritization

**Paid Tier Limits**

- Credit Based Limit (1000 Credits per Month per Paid Tier user)
- No Document storage
- Cost is ($1 per 100 Credits)

**Rate Limiting**

- Upstash-based rate limiting per user
- Graceful degradation with queue system
- Clear user feedback on quota status

---

## 7. User Experience & Interface Design

### 7.1 Core User Journeys

**New User Onboarding**

1. Sign up with email or Google OAuth
2. Complete profile with academic details
3. Guided tour of key features
4. Option to start from template or blank project
5. First AI interaction tutorial

**Creating a New Project**

1. Project setup wizard with discipline selection
2. AI-suggested project ideas based on profile
3. Milestone template selection
4. Team member invitation (optional)
5. Initial document structure creation

**Daily Usage Pattern**

1. Dashboard shows today's tasks and deadlines
2. Quick AI assistance through floating action button
3. Progress updates reflected in visual trackers
4. Notifications for team activities and deadlines

### 7.2 Key Pages & Components

**Landing Page**

- Hero section highlighting AI capabilities
- Feature showcase with interactive demos
- Student testimonials and success metrics
- Clear CTA for sign-up

**Dashboard**

- Project overview cards with progress rings
- Upcoming deadlines widget
- Quick action buttons for AI tools
- Activity timeline
- Statistics and achievements

**Project Workspace**

- Tabbed interface for tasks, documents, AI tools, team
- Kanban board view option
- Timeline/calendar view
- Integrated AI chat sidebar

**AI Tool Pages**

- Clean, focused interfaces per tool
- Input forms with helpful placeholders
- Real-time response rendering
- Save/export options
- History of previous interactions

**Document Editor**

- Rich text editing with markdown support
- AI writing assistant panel
- Version history sidebar
- Collaboration indicators
- Export to DOCX/PDF

### 7.3 Responsive Design Considerations

- Mobile-first approach for on-the-go access
- Touch-friendly task management on tablets
- Optimized AI interfaces for smaller screens
- Progressive Web App capabilities for offline task viewing

---
