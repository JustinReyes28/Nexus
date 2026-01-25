# Unimplemented Features in Nexus AI Platform

This document outlines the features that are mentioned in the project's README but are not yet fully implemented in the codebase. Based on the analysis of the codebase, the following features are either missing or partially implemented.

## Table of Contents

- [Collaboration Features](#collaboration-features)
- [Resource Library](#resource-library)
- [Advisor Communication](#advisor-communication)
- [Template Center](#template-center)
- [Knowledge Base](#knowledge-base)
- [Video Tutorials](#video-tutorials)
- [Additional Missing Features](#additional-missing-features)

## Collaboration Features

### Team Workspaces with Advanced Permissions

- **Status**: Partially Implemented
- **Description**: The codebase includes team functionality with role-based permissions (OWNER, ADMIN, MEMBER, VIEWER) and fully functional User Invitations. Advanced workspace features like granular permissions per project resource are still in progress.
- **Evidence**: `TeamMember` model and team-related API routes are implemented. `InviteTeamMemberModal` and `TeamSection` components are functional.

### Advisor Communication: Structured Feedback Request System

- **Status**: Not Implemented
- **Description**: The README mentions a structured feedback request system for advisors, but there is no code implementing advisor-specific communication features.
- **Evidence**: No advisor-specific models, API routes, or UI components found in the codebase.

## Resource Library

### Template Center by Discipline

- **Status**: Fully Implemented
- **Description**: Pre-built templates for common capstone project structures across different disciplines are now available. Users can select a template during project creation which automatically populates relevant tasks.
- **Evidence**: `Template` model is seeded, API routes are functional, and `TemplateSelector` is integrated into the "New Project" page. `createProject` action now handles automatic task generation.

### Knowledge Base

- **Status**: Not Implemented
- **Description**: The README mentions a knowledge base with best practices and sample projects, but no implementation exists.
- **Evidence**: No knowledge base models, API routes, or UI components found.

### Video Tutorials

- **Status**: Not Implemented
- **Description**: No video tutorial system exists in the codebase.
- **Evidence**: No video tutorial models, API routes, or UI components found.

## User Management

### Role-Based Access Control with ADVISOR and ADMIN Roles

- **Status**: Partially Implemented
- **Description**: The `Role` enum includes ADVISOR and ADMIN roles, but advisor-specific functionality is not implemented.
- **Evidence**: `Role` enum in Prisma schema includes ADVISOR and ADMIN, but no advisor-specific features are implemented.

## Additional Missing Features

### Master Plan Route/Modal

- **Status**: Not Implemented
- **Description**: The deadline widget has a TODO for implementing navigation to a master plan route.
- **Evidence**: Found TODO comment in `src/components/dashboard/DeadlineWidget.tsx` line 60: "Implement navigation to master plan route or open master plan modal".

### Document Versioning System

- **Status**: Partially Implemented
- **Description**: The database schema includes a `DocumentVersion` model, but no UI or API endpoints for document versioning.
- **Evidence**: `DocumentVersion` model exists in Prisma schema but no corresponding functionality is implemented.

### Advanced Notification System

- **Status**: Partially Implemented
- **Description**: The database includes a `NotificationPreference` model with various notification types, but the full notification system is not implemented.
- **Evidence**: `NotificationPreference` model exists in Prisma schema with fields for different notification types.

### Premium Features

- **Status**: Partially Implemented
- **Description**: The codebase includes tier-based systems (FREE/PREMIUM) and AI credit limits, but premium-specific features are not fully implemented.
- **Evidence**: `Tier` enum and `aiCreditsLimit` field in User model in Prisma schema.

## Technical Implementation Notes

### AI Component Type Compatibility Issues

- Several AI components have TODO comments about type compatibility issues between different message interfaces:
  - `src/components/ai/ChatHistoryPanel.tsx` - Accessibility and state management
  - `src/components/ai/ChatInterface.tsx` - Input validation and security
  - `src/components/ai/MethodologyAdvisorView.tsx` - Type compatibility issues
  - `src/components/ai/ProgressAnalyzerView.tsx` - Type compatibility issues
  - `src/components/ai/ProposalWriterView.tsx` - Role type mismatch issues

### Missing API Endpoints

Based on the Prisma schema, the following models lack corresponding API routes:

- DocumentVersion
- NotificationPreference (partial implementation)

## Recommendations

1. **Prioritize Advisor Communication System**: Implement the structured feedback request system as it's a key feature for academic use.
2. **Complete Template Management**: Develop the template center functionality as referenced in the database schema.
3. **Build Knowledge Base**: Create the resource library with best practices and sample projects.
4. **Implement Real Activity Feed**: Replace mock data with real database queries.
5. **Add Video Tutorial Integration**: Create a system for hosting and accessing video tutorials.
6. **Complete Document Versioning**: Implement the document versioning system as defined in the schema.
7. **Fix AI Component Issues**: Address the type compatibility problems in AI components.

These unimplemented features represent significant opportunities for enhancing the Nexus platform's functionality and user experience.
