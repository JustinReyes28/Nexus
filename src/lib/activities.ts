import { db } from "./db";
import { ActivityType } from "@prisma/client";

interface RecordActivityParams {
  type: ActivityType;
  userId: string;
  projectId?: string;
  targetId?: string;
  targetName: string;
}

/**
 * Records a new activity in the database.
 * This utility can be used across server components, actions, and API routes.
 */
export async function recordActivity({
  type,
  userId,
  projectId,
  targetId,
  targetName,
}: RecordActivityParams) {
  const maskedUserId = userId
    ? userId.length <= 4
      ? "****"
      : userId.length <= 8
        ? `${userId.slice(0, 2)}...${userId.slice(-2)}`
        : `${userId.slice(0, 4)}...${userId.slice(-4)}`
    : "unknown";
  console.log(`[ACTIVITY_RECORDER] Recording ${type} for user <${maskedUserId}> on project ${projectId}`);
  try {
    const activity = await db.activity.create({
      data: {
        type,
        userId,
        projectId,
        targetId,
        targetName,
      },
    });
    console.log(`[ACTIVITY_RECORDER] Successfully recorded activity ${activity.id}`);
  } catch (error) {
    // We don't want to crash the main operation just because logging failed
    console.error(`[ACTIVITY_RECORDER] Error recording activity:`, error);
  }
}
