import { AdminEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type CreateAdminEventParams = {
  type: AdminEventType;
  title: string;
  description?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  actorId?: string | null;
};

export async function createAdminEvent(params: CreateAdminEventParams) {
  try {
    await prisma.adminEvent.create({
      data: {
        type: params.type,
        title: params.title,
        description: params.description ?? null,
        entityType: params.entityType ?? null,
        entityId: params.entityId ?? null,
        actorId: params.actorId ?? null,
      },
    });
  } catch (error) {
    console.error("Admin event creation failed", error);
  }
}
