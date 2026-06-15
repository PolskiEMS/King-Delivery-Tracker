import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const deliveries = await prisma.delivery.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: true, route: { include: { driver: true, vehicle: true } } },
  });
  return NextResponse.json({ ok: true, deliveries });
}
