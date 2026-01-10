# Chat History Retention Technical Specification

## Overview

This document outlines the technical implementation plan for adding chat history retention policies based on user subscription tiers. The system will automatically manage conversation lifecycles by setting expiration dates based on whether a user is FREE or PREMIUM, with automatic cleanup of expired conversations.

## Requirements

### Functional Requirements

- FREE users: Conversations retained for 1 day
- PREMIUM users: Conversations retained for 30 days
- Automatic cleanup of expired conversations
- Backward compatibility with existing data
- No impact on user experience during normal operations

### Non-functional Requirements

- Minimal performance impact on AI API calls
- Automatic cleanup without manual intervention
- Data integrity maintained during migration

## Database Schema Changes

### AIConversation Model Updates

```prisma
model AIConversation {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  feature     AIFeature
  prompt      String
  response    String
  tokensUsed  Int
  createdAt   DateTime  @default(now())
  expiresAt   DateTime  // TTL index for automatic cleanup

  userId      String    @db.ObjectId
  user        User      @relation(fields: [userId], references: [id])

  projectId   String?   @db.ObjectId
  project     Project?  @relation(fields: [projectId], references: [id])

  @@index([expiresAt]) // TTL index for automatic cleanup
}
```

### Changes Made:

1. Added `expiresAt` field of type `DateTime` to store the expiration timestamp
2. Added `@@index([expiresAt])` to enable MongoDB's TTL (Time To Live) functionality for automatic cleanup

## Constants and Configuration

### Retention Policy Constants

Location: `src/config/ai.ts`

```typescript
export const CONVERSATION_RETENTION_POLICY = {
  FREE: {
    days: 1,
    milliseconds: 1 * 24 * 60 * 1000, // 1 day in ms
    description: "Conversations retained for 1 day for FREE users",
  },
  PREMIUM: {
    days: 30,
    milliseconds: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
    description: "Conversations retained for 30 days for PREMIUM users",
  },
};
```

### Expiration Date Calculation Function

```typescript
/**
 * Calculate conversation expiration date based on user tier
 * @param userTier - The user's subscription tier ('FREE' | 'PREMIUM')
 * @returns Date when the conversation should expire
 */
export function getConversationExpirationDate(
  userTier: "FREE" | "PREMIUM"
): Date {
  const retentionPolicy =
    userTier === "PREMIUM"
      ? CONVERSATION_RETENTION_POLICY.PREMIUM
      : CONVERSATION_RETENTION_POLICY.FREE;

  return new Date(Date.now() + retentionPolicy.milliseconds);
}
```

## Implementation Details

### API Route Modifications

All AI API routes that create conversations have been updated to include the expiration date calculation:

1. **Import the new functions**:

   ```typescript
   import {
     getConversationExpirationDate,
     CONVERSATION_RETENTION_POLICY,
   } from "@/config/ai";
   ```

2. **Fetch user tier**:

   ```typescript
   const userWithTier = await db.user.findUnique({
     where: { id: session.user.id as string },
     select: { tier: true },
   });
   ```

3. **Add expiresAt to conversation creation**:
   ```typescript
   db.aIConversation.create({
     data: {
       feature: "FEATURE_TYPE",
       prompt: sanitizedPrompt as string,
       response: responseText,
       tokensUsed: usage?.totalTokens ?? estimateTokens(prompt + responseText),
       userId: session.user.id,
       expiresAt: getConversationExpirationDate(userWithTier?.tier || "FREE"), // NEW FIELD
     },
   });
   ```

### Affected API Routes

- `src/app/api/ai/chat/route.ts`
- `src/app/api/ai/ideas/route.ts`
- `src/app/api/ai/research/route.ts`
- `src/app/api/ai/proposal/route.ts`
- `src/app/api/ai/progress/route.ts`
- `src/app/api/ai/writing/route.ts`

## TTL Index Implementation

MongoDB's TTL (Time To Live) index is implemented through the Prisma schema:

```prisma
@@index([expiresAt]) // TTL index for automatic cleanup
```

This creates an index on the `expiresAt` field that automatically removes documents when their expiration time has passed. MongoDB's background task periodically removes expired documents from collections with TTL indexes.

### TTL Index Behavior

- Documents with an `expiresAt` date in the past are automatically deleted
- Deletion happens asynchronously by MongoDB's background task
- The cleanup process runs approximately every 60 seconds
- Documents with null or invalid `expiresAt` values are never deleted

## Backward Compatibility Strategy

### Data Migration

For existing conversations without an `expiresAt` field, we implement the following strategy:

1. **Database Migration**: Update existing records with appropriate expiration dates based on their creation date and the user's current tier
2. **Fallback Logic**: Handle cases where `expiresAt` might be null

### Handling Existing Data

When querying conversations, we can filter out records that would have expired based on the retention policy:

```typescript
// Example query that excludes expired conversations
const activeConversations = await db.aIConversation.findMany({
  where: {
    userId: session.user.id,
    OR: [
      { expiresAt: { gte: new Date() } }, // Not expired yet
      { expiresAt: null }, // Legacy conversations without expiration
    ],
  },
  orderBy: { createdAt: "desc" },
});
```

## Implementation Steps

### Step 1: Schema Changes

1. Update `prisma/schema.prisma` with the new `expiresAt` field and TTL index
2. Run Prisma migration: `npx prisma migrate dev --name add-expires-at-to-conversations`

### Step 2: Configuration Updates

1. Add retention policy constants to `src/config/ai.ts`
2. Add expiration date calculation function

### Step 3: API Route Modifications

1. Update all AI API routes to include expiration date calculation
2. Import necessary functions
3. Fetch user tier during conversation creation
4. Set appropriate expiration date

### Step 4: Testing

1. Verify that new conversations get proper expiration dates
2. Test both FREE and PREMIUM user flows
3. Validate that TTL index works as expected

## Security Considerations

1. **Access Control**: Only authenticated users can create conversations
2. **Data Integrity**: Proper validation of user tier before setting expiration
3. **Privacy**: Expired conversations are permanently removed from the database

## Performance Impact

1. **Read Operations**: Minimal impact - only adds an additional field to queries
2. **Write Operations**: Slight increase due to fetching user tier and calculating expiration date
3. **Storage**: Temporary increase until TTL cleanup begins
4. **Automatic Cleanup**: Offloaded to MongoDB's background processes

## Rollback Strategy

In case of issues:

1. Remove the `expiresAt` field from the schema
2. Revert API route changes
3. Run Prisma migration to rollback the database changes

## Monitoring and Maintenance

### Key Metrics to Monitor

1. Conversation creation rate by user tier
2. Database storage usage trends
3. API response times for AI endpoints
4. Number of conversations being automatically cleaned up

### Maintenance Tasks

1. Monitor TTL index effectiveness
2. Adjust retention periods based on usage patterns
3. Regular cleanup verification

## Future Enhancements

1. **Custom Retention Periods**: Allow enterprise users to customize retention periods
2. **Export Before Expiry**: Notify users before conversations are deleted
3. **Bulk Extension**: Allow users to extend retention for specific conversations
4. **Analytics**: Track conversation usage patterns to optimize retention policies

## Conclusion

This technical specification provides a robust solution for implementing chat history retention based on user subscription tiers. The approach leverages MongoDB's built-in TTL index functionality for automatic cleanup while maintaining backward compatibility with existing data. The implementation follows best practices for data privacy and ensures minimal performance impact on the application.
