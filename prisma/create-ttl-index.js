// MongoDB TTL index creation script for AIConversation collection
// Run with: npx prisma db execute --file prisma/create-ttl-index.js --schema prisma/schema.prisma

// This script creates a TTL index on the expiresAt field in MongoDB
// The index will automatically delete documents when their expiresAt time is reached

db.AIConversation.createIndex(
  { "expiresAt": 1 },
  { 
    "expireAfterSeconds": 0,
    "name": "expiresAt_ttl"
  }
);

print('✅ TTL index created successfully on AIConversation.expiresAt');
print('   Documents will be automatically deleted when expiresAt time is reached');