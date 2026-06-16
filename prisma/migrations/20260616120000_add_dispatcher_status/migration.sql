CREATE TYPE "DispatcherStatus" AS ENUM ('AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE');

ALTER TABLE "User" ADD COLUMN "dispatcherStatus" "DispatcherStatus" NOT NULL DEFAULT 'OFFLINE';
