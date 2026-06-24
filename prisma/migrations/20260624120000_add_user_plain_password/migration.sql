ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT '';

UPDATE "User"
SET "password" = 'demo123'
WHERE "email" IN ('admin@king.pl', 'dyspozytor@king.pl', 'kierowca@king.pl')
  AND "password" = '';
