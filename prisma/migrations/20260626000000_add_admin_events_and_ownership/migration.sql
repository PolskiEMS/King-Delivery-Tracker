-- CreateEnum
CREATE TYPE "AdminEventType" AS ENUM ('ORDER_CREATED', 'ORDER_UPDATED', 'ORDER_DELETED', 'ROUTE_CREATED', 'ROUTE_UPDATED', 'ROUTE_DELETED', 'DRIVER_CREATED', 'DRIVER_UPDATED', 'DRIVER_DELETED', 'DELIVERY_STATUS_CHANGED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "createdById" TEXT,
ADD COLUMN "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Route" ADD COLUMN "createdById" TEXT,
ADD COLUMN "updatedById" TEXT,
ADD COLUMN "editableById" TEXT;

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN "createdById" TEXT,
ADD COLUMN "updatedById" TEXT;

-- CreateTable
CREATE TABLE "AdminEvent" (
    "id" TEXT NOT NULL,
    "type" "AdminEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Order_createdById_idx" ON "Order"("createdById");
CREATE INDEX "Order_updatedById_idx" ON "Order"("updatedById");
CREATE INDEX "Route_createdById_idx" ON "Route"("createdById");
CREATE INDEX "Route_updatedById_idx" ON "Route"("updatedById");
CREATE INDEX "Route_editableById_idx" ON "Route"("editableById");
CREATE INDEX "Driver_createdById_idx" ON "Driver"("createdById");
CREATE INDEX "Driver_updatedById_idx" ON "Driver"("updatedById");
CREATE INDEX "AdminEvent_createdAt_idx" ON "AdminEvent"("createdAt");
CREATE INDEX "AdminEvent_actorId_idx" ON "AdminEvent"("actorId");
CREATE INDEX "AdminEvent_type_idx" ON "AdminEvent"("type");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Route" ADD CONSTRAINT "Route_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Route" ADD CONSTRAINT "Route_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Route" ADD CONSTRAINT "Route_editableById_fkey" FOREIGN KEY ("editableById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AdminEvent" ADD CONSTRAINT "AdminEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
