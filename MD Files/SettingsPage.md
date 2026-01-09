# Settings Page Implementation

## Overview

The settings button in the sidebar navigates to `/settings` and should provide users with comprehensive account management capabilities. The page must strictly adhere to the Nexus design system defined in `MD Files/Design.md`, using the established color palette, typography, button styles, and visual patterns to maintain visual consistency across the platform.

**Design System Compliance**: All components must use the defined CSS variables, font families, animation patterns, and layout structures from the design documentation.

## Core Settings Sections

### 1. Profile Settings

**Purpose**: Allow users to manage their personal and academic information

**Fields to implement**:

- **Name**: Editable text field with `.input` styling
- **Email**: Display only (with verification status indicator) - styled as disabled input
- **Institution**: Text field for university/organization name
- **Program**: Text field for academic program/major
- **Year**: Dropdown with options (e.g., "1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate", "PhD")
- **Profile Picture**: Upload/Change avatar using `.button-secondary` style

**Visual Design**:

- Use `.card` styling for each section
- Apply `.rounded-xl` and `.shadow-md` for depth
- Use `.font-heading` for section titles
- Apply `.text-primary` for labels
- Use `.gap-6` for spacing between form elements

**API Requirements**:

- `PUT /api/user/profile` - Update profile information
- `POST /api/user/avatar` - Upload profile picture

### 2. Authentication & Security

**Purpose**: Manage password and OAuth connections

**Features**:

- **Change Password**: Current password + new password + confirm new password
  - Use `.input` fields with proper validation states
  - `.button-primary` for submit action
- **Connected Accounts**: Show Google OAuth connection status
  - "Connected with Google" + `.button-outline` for disconnect
  - "Connect Google Account" with `.button-secondary`
- **Two-Factor Authentication**: Toggle (future enhancement)

**Visual Design**:

- Group related fields in `.card` containers
- Use `.border-crimson` for active states
- Apply `.animate-pulse-organic` for AI-related security features

**API Requirements**:

- `PUT /api/user/password` - Change password
- `POST /api/auth/google/link` - Link Google account
- `DELETE /api/auth/google/unlink` - Unlink Google account

### 3. AI Credits & Usage

**Purpose**: Display and manage AI feature usage

**Display**:

- **Current Tier**: FREE/PREMIUM badge with `.button-ai` upgrade option
- **AI Credits Used**: Progress bar showing `aiCreditsUsed` / `aiCreditsLimit`
  - Use `.bg-teal` for progress fill
  - Apply `.animate-pulse-organic` to the progress indicator
- **Usage Statistics**:
  - Total AI queries this month
  - Tokens consumed
  - Features used (breakdown by AI feature type)

**Actions**:

- **Upgrade to Premium**: `.button-ai` with `.animate-sparkle` on hover
- **View Usage History**: `.button-ghost` link

**Visual Design**:

- Use `.bg-teal/5` background for AI sections
- Apply `.border-teal` for AI-related cards
- Use `.font-handwritten` for AI status messages
- Include `.animate-float` for premium tier indicators

**API Requirements**:

- `GET /api/user/credits` - Get current credits and usage
- `GET /api/user/usage-history` - Get detailed usage statistics
- `POST /api/user/upgrade` - Handle subscription upgrade

### 4. Notifications Settings

**Purpose**: Control email and in-app notifications

**Options**:

- **Email Notifications**:
  - Project deadline reminders
  - Team member updates
  - AI analysis completions
  - New feature announcements
- **In-App Notifications**:
  - Real-time task updates
  - Mention notifications
  - AI progress nudges

**Visual Design**:

- Use `.card` styling for notification groups
- Apply `.rounded-lg` for toggle switches
- Use `.text-ai` for AI-related notification labels
- Implement custom toggle switches with `.bg-crimson` for active state

**API Requirements**:

- `PUT /api/user/notifications` - Update notification preferences

### 5. Data Management

**Purpose**: Export and delete user data

**Features**:

- **Export Data**: Download all user data
  - `.button-secondary` with `.animate-float` for export action
- **Delete Account**:
  - `.button-outline` with `.text-crimson` for danger action
  - Confirmation modal with password verification
  - Cascading deletion (handled by Prisma relations)
  - Warning about permanent data loss

**Visual Design**:

- Use `.bg-grain` texture for data management section
- Apply `.shadow-xl` for modal overlays
- Use `.border-crimson` for delete confirmation
- Include `.animate-bounce` for warning indicators

**API Requirements**:

- `GET /api/user/export` - Generate data export
- `DELETE /api/user/account` - Delete account

## UI/UX Considerations

### Layout Structure

```
Settings Page
├── Profile Settings (default view)
├── Security
├── AI & Subscription
├── Notifications
└── Data Management
```

### Design System Implementation

**Typography**:

- All section headers: `.font-heading`, `.font-bold`, `.text-2xl`
- Field labels: `.font-body`, `.font-semibold`, `.text-sm`
- Helper text: `.font-body`, `.text-xs`, `.text-gray-600`

**Color Application**:

- Primary actions: `var(--crimson)` background, white text
- AI features: `var(--teal)` background, white text
- Secondary actions: `var(--sunny)` background, dark text
- Neutral elements: `var(--canvas)` background, gray text

**Button Variants**:

- Save/Update: `.button-primary`
- Upgrade: `.button-ai`
- Cancel/Disconnect: `.button-outline`
- Export: `.button-secondary`
- Delete: `.button-outline` with crimson styling
- Ghost actions: `.button-ghost`

**Spacing & Layout**:

- Container: `.container` with responsive padding
- Section spacing: `.py-8` between major sections
- Card spacing: `.gap-6` within grids
- Form spacing: `.gap-4` between fields

**Animations**:

- AI credit progress: `.animate-pulse-organic`
- Premium upgrade button: `.animate-sparkle` on hover
- Export action: `.animate-float`
- Warning indicators: `.animate-bounce`
- Success states: `.animate-sparkle`

### Component Structure

```typescript
// src/app/(dashboard)/settings/page.tsx
export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="grid gap-6">
          <ProfileSettings />
          <SecuritySettings />
          <AISettings />
          <NotificationSettings />
          <DataManagement />
        </div>
      </div>
    </DashboardLayout>
  );
}
```

### Form Components

**Input Fields**:

```typescript
<input className="input font-body" placeholder="Enter your name" />
```

**Cards**:

```typescript
<div className="card rounded-xl shadow-md">
  <h3 className="h6 font-heading font-bold text-primary mb-4">Section Title</h3>
  {/* form content */}
</div>
```

**Buttons**:

```typescript
<button className="button button-primary button-md">Save Changes</button>
```

**AI Elements**:

```typescript
<div className="bg-teal/5 border border-teal rounded-xl p-6">
  <div className="animate-pulse-organic">AI Credits: 85/100</div>
</div>
```

### Validation

- Use existing validation patterns from `src/lib/validation.ts`
- Implement form validation for password changes
- Validate academic information fields
- Email format validation (though email should be read-only)
- Real-time validation with visual feedback (`.border-crimson` for errors)

## API Routes to Implement

### User Profile Routes

```typescript
// src/app/api/user/profile/route.ts
PUT /api/user/profile - Update profile information
```

### Password Routes

```typescript
// src/app/api/user/password/route.ts
PUT /api/user/password - Change password
```

### Credits & Usage Routes

```typescript
// src/app/api/user/credits/route.ts
GET /api/user/credits - Get credits and usage

// src/app/api/user/usage-history/route.ts
GET /api/user/usage-history - Get detailed usage
```

### Account Management Routes

```typescript
// src/app/api/user/account/route.ts
DELETE /api/user/account - Delete account

// src/app/api/user/export/route.ts
GET /api/user/export - Export user data
```

### Notification Routes

```typescript
// src/app/api/user/notifications/route.ts
PUT /api/user/notifications - Update preferences
```

## Security Considerations

1. **Authentication**: All routes must require valid session
2. **Authorization**: Users can only modify their own data
3. **Password Changes**: Require current password verification
4. **Account Deletion**: Require password confirmation + modal confirmation
5. **Email Changes**: Should trigger verification process (if implemented)
6. **Rate Limiting**: Apply to sensitive operations (password changes, deletions)

## Future Enhancements

1. **API Key Management**: Generate/revoke API keys for integrations
2. **Theme Preferences**: Light/dark mode toggle
3. **Language Settings**: Multi-language support
4. **Advanced AI Settings**: Fine-tune AI behavior preferences
5. **Team Management**: View/leave teams (if user is a member)
6. **Billing History**: View past payments and invoices
7. **Referral Program**: Track referrals and rewards

## Integration Points

- **NextAuth**: For OAuth connections and session management
- **Prisma**: For all database operations
- **Toast Notifications**: For user feedback
- **Analytics**: Track settings changes for product insights
- **Email Service**: Send confirmation emails for sensitive actions

## Testing Checklist

- [ ] Profile information updates correctly
- [ ] Password change works with validation
- [ ] AI credits display accurately
- [ ] Notification preferences persist
- [ ] Data export generates complete file
- [ ] Account deletion removes all related data
- [ ] OAuth linking/unlinking works
- [ ] Mobile responsive design
- [ ] Loading states display properly
- [ ] Error handling shows appropriate messages
- [ ] Success notifications appear after changes
- [ ] All animations work smoothly
- [ ] Color system is consistent throughout
- [ ] Typography hierarchy is maintained

## Notes

- The settings page should be accessible only to authenticated users
- Consider implementing a "dirty form" warning if user has unsaved changes
- Add a "Save" button that appears only when changes are detected
- Use the existing `cn` utility for class name merging
- Follow the same import patterns as other dashboard components
- Maintain consistency with the existing sidebar navigation styling
- All visual elements must use the design system's CSS variables
- Animations should be subtle and not interfere with usability
- Mobile breakpoints must match the design system's responsive patterns
