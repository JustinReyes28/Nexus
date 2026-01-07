Phase 3: Database Schema (Prisma + MongoDB)
[NEW]
schema.prisma
generator client {
provider = "prisma-client-js"
}
datasource db {
provider = "mongodb"
url = env("DATABASE_URL")
}
model User {
id String @id @default(auto()) @map("\_id") @db.ObjectId
email String @unique
emailVerified DateTime?
password String?
name String?
image String?
institution String?
program String?
year String?
role Role @default(STUDENT)
tier Tier @default(FREE)
aiCreditsUsed Int @default(0)
aiCreditsLimit Int @default(100)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
accounts Account[]
projects Project[]
tasks Task[]
documents Document[]
conversations AIConversation[]
teamMemberships TeamMember[]
}
model Project {
id String @id @default(auto()) @map("\_id") @db.ObjectId
title String
description String?
discipline String?
status ProjectStatus @default(IDEATION)
startDate DateTime?
deadline DateTime?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
ownerId String @db.ObjectId
owner User @relation(fields: [ownerId], references: [id])
tasks Task[]
documents Document[]
conversations AIConversation[]
team TeamMember[]
}
model Task {
id String @id @default(auto()) @map("\_id") @db.ObjectId
title String
description String?
status TaskStatus @default(TODO)
priority Priority @default(MEDIUM)
dueDate DateTime?
completedAt DateTime?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
projectId String @db.ObjectId
project Project @relation(fields: [projectId], references: [id])
assigneeId String? @db.ObjectId
assignee User? @relation(fields: [assigneeId], references: [id])
}
model Document {
id String @id @default(auto()) @map("\_id") @db.ObjectId
title String
content String?
fileUrl String?
fileType String?
version Int @default(1)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
projectId String @db.ObjectId
project Project @relation(fields: [projectId], references: [id])
authorId String @db.ObjectId
author User @relation(fields: [authorId], references: [id])
versions DocumentVersion[]
}
model DocumentVersion {
id String @id @default(auto()) @map("\_id") @db.ObjectId
content String
version Int
createdAt DateTime @default(now())

documentId String @db.ObjectId
document Document @relation(fields: [documentId], references: [id])
}
model AIConversation {
id String @id @default(auto()) @map("\_id") @db.ObjectId
feature AIFeature
prompt String
response String
tokensUsed Int
createdAt DateTime @default(now())
userId String @db.ObjectId
user User @relation(fields: [userId], references: [id])
projectId String? @db.ObjectId
project Project? @relation(fields: [projectId], references: [id])
}
model TeamMember {
id String @id @default(auto()) @map("\_id") @db.ObjectId
role TeamRole @default(MEMBER)
joinedAt DateTime @default(now())
userId String @db.ObjectId
user User @relation(fields: [userId], references: [id])
projectId String @db.ObjectId
project Project @relation(fields: [projectId], references: [id])
@@unique([userId, projectId])
}
model Template {
id String @id @default(auto()) @map("\_id") @db.ObjectId
title String
description String?
content String
category String
discipline String?
usageCount Int @default(0)
createdAt DateTime @default(now())
}
model Account {
id String @id @default(auto()) @map("\_id") @db.ObjectId
userId String @db.ObjectId
type String
provider String
providerAccountId String
refresh_token String?
access_token String?
expires_at Int?
token_type String?
scope String?
id_token String?
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
@@unique([provider, providerAccountId])
}
enum Role {
STUDENT
ADVISOR
ADMIN
}
enum Tier {
FREE
PREMIUM
}
enum ProjectStatus {
IDEATION
PROPOSAL
RESEARCH
DEVELOPMENT
WRITING
REVIEW
COMPLETED
}
enum TaskStatus {
TODO
IN_PROGRESS
REVIEW
COMPLETED
}
enum Priority {
LOW
MEDIUM
HIGH
URGENT
}
enum AIFeature {
IDEA_GENERATOR
RESEARCH_ASSISTANT
PROPOSAL_WRITER
METHODOLOGY_ADVISOR
PROGRESS_ANALYZER
WRITING_ASSISTANT
}
enum TeamRole {
OWNER
ADMIN
MEMBER
VIEWER
}
