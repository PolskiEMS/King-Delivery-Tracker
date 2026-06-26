import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = await prisma.adminEvent.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    include: { actor: true },
  });

  return NextResponse.json({ events });
}
