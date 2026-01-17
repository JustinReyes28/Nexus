# Drafts Page Implementation Plan

## Overview
Implementation plan for adding a `/drafts` page to display user's draft projects in the Nexus application.

## Current State Analysis

### Existing Infrastructure
- **Drafts Page**: Exists at `src/app/(dashboard)/drafts/page.tsx` but shows placeholder only
- **Project System**: MongoDB with Prisma, uses `ProjectStatus` enum (IDEATION, PROPOSAL, RESEARCH, etc.)
- **UI Components**: `ProjectCard` component exists and can be reused
- **API**: Projects API endpoint at `/api/projects` with full CRUD operations
- **Authentication**: NextAuth.js integration with session management

### Project Status System
Current statuses: `IDEATION`, `PROPOSAL`, `RESEARCH`, `DEVELOPMENT`, `WRITING`, `REVIEW`, `COMPLETED`

## Implementation Strategy

### Core Concept
Use existing project system with **IDEATION status** as the definition of a "draft". This approach:
- ✅ Leverages existing infrastructure
- ✅ No database schema changes required
- ✅ Minimal code duplication
- ✅ Maintains consistency with current design patterns

## Phase 1: Core Drafts Functionality

### 1. Create Drafts API Endpoint
**File**: `src/app/api/drafts/route.ts`

```typescript
// GET /api/drafts
// Returns projects where status = 'IDEATION' for current user
```

**Features**:
- Authentication check
- Query for IDEATION status projects
- Include task counts
- Sort by updatedAt (newest first)
- Error handling

### 2. Update Drafts Page
**File**: `src/app/(dashboard)/drafts/page.tsx`

**Changes**:
- Replace placeholder with actual draft listing
- Fetch from `/api/drafts` endpoint
- Use existing `ProjectCard` component
- Add loading and error states
- Add "Create New Draft" button

**Layout**:
```
My Drafts
├── Draft Projects Grid (using ProjectCard)
│   ├── Project Title
│   ├── Description
│   ├── Status Badge (Draft)
│   └── Task Count
├── Empty State
└── Create New Draft Button
```

### 3. Add Visual Distinction for Drafts
**File**: `src/components/dashboard/ProjectCard.tsx`

**Visual Cues**:
- Subtle "Draft" badge or label
- Lighter border color
- Different background tint
- Maintain consistency with existing design

**Example**:
```typescript
// Add draft-specific styling
const draftStyles = project.status === 'IDEATION' 
  ? 'border-gray-300 bg-gray-50' 
  : '';
```

## Phase 2: Navigation & Workflow

### 4. Add Navigation to Drafts Page
**File**: `src/components/dashboard/Sidebar.tsx`

**Implementation**:
- Add "Drafts" menu item
- Use document/pencil icon
- Link to `/drafts` route
- Position in logical location in sidebar

### 5. Update Project Creation Workflow
**File**: `src/lib/actions.ts` (createProject action)

**Changes**:
- Ensure new projects default to IDEATION status
- Maintain backward compatibility
- No breaking changes to existing API

## Phase 3: Publishing Functionality

### 6. Add Publish Action
**File**: `src/app/api/projects/[id]/publish/route.ts`

**Endpoint**: `PATCH /api/projects/:id/publish`

**Functionality**:
- Change status from IDEATION to PROPOSAL
- Update updatedAt timestamp
- Validation and error handling
- Authentication check

### 7. Add Publish Button to Drafts
**File**: `src/app/(dashboard)/drafts/page.tsx`

**Features**:
- "Publish" button per draft
- Confirmation dialog
- API call to publish endpoint
- Redirect after successful publish

## Technical Specifications

### Draft Definition
```typescript
const isDraft = (project: Project) => project.status === 'IDEATION';
```

### Data Flow
```
User Creates Project
    ↓
Status = IDEATION (Draft)
    ↓
Appears in /drafts page
    ↓
User Publishes Draft
    ↓
Status = PROPOSAL (Active Project)
    ↓
Moves to main dashboard
```

### API Endpoints

#### GET /api/drafts
```json
{
  "drafts": [
    {
      "id": "...",
      "title": "...",
      "description": "...",
      "status": "IDEATION",
      "_count": { "tasks": 3 },
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### PATCH /api/projects/:id/publish
```json
{
  "status": "PROPOSAL",
  "updatedAt": "..."
}
```

## User Experience

### Drafts Page Layout
- Grid layout matching dashboard
- Subtle draft indicators
- Quick actions (edit, publish, delete)
- Search and filter capabilities (future enhancement)

### Publishing Flow
1. User clicks "Publish" on draft
2. Confirmation dialog appears
3. API call to publish endpoint
4. Success feedback
5. Redirect to project details page

## Dependencies
- ✅ Existing project system
- ✅ Prisma and MongoDB setup
- ✅ NextAuth.js authentication
- ✅ ProjectCard component
- ✅ Dashboard layout components
- ✅ API infrastructure

## Timeline Estimate
- **Phase 1 (Core)**: 1-2 hours
- **Phase 2 (Navigation)**: 30-60 minutes  
- **Phase 3 (Publishing)**: 1-2 hours
- **Total**: 3-5 hours

## Testing Considerations
- API endpoint authentication
- Data filtering (only show user's drafts)
- Visual distinction verification
- Publishing workflow
- Error handling
- Edge cases (empty state, network errors)

## Future Enhancements
- Draft search and filtering
- Batch operations on drafts
- Draft sharing/collaboration
- Draft version history
- Auto-save functionality
- Draft templates

## Migration Strategy
- No database migrations required
- Existing projects remain unaffected
- New projects default to draft status
- Existing IDEATION projects automatically become "drafts"

## Rollback Plan
- Remove `/drafts` route
- Remove API endpoint
- Revert ProjectCard changes
- Remove sidebar navigation
- No data loss (status system unchanged)