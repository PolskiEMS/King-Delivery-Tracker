import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  const routes = await prisma.route.findMany({
    orderBy: { createdAt: "desc" },
    include: { driver: true, vehicle: true, deliveries: { include: { order: true }, orderBy: { sequence: "asc" } } },
  });
  return NextResponse.json({ ok: true, routes });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "Nieprawidłowy format JSON." }, { status: 400 });
  }

  const routeNumber = clean(body.routeNumber);
  const name = clean(body.name);
  const orderIds = Array.isArray(body.orderIds) ? body.orderIds.filter((id): id is string => typeof id === "string" && id.length > 0) : [];

  if (!routeNumber || !name) {
    return NextResponse.json({ ok: false, error: "Pola routeNumber i name są wymagane." }, { status: 400 });
  }

  try {
    const route = await prisma.$transaction(async (tx) => {
      const createdRoute = await tx.route.create({
        data: {
          routeNumber,
          name,
          plannedDate: clean(body.plannedDate) ? new Date(clean(body.plannedDate)) : null,
          driverId: clean(body.driverId) || null,
          vehicleId: clean(body.vehicleId) || null,
          notes: clean(body.notes) || null,
        },
      });

      if (orderIds.length > 0) {
        const orders = await tx.order.findMany({ where: { id: { in: orderIds } } });
        await Promise.all(orders.map((order, index) =>
          tx.delivery.create({
            data: {
              deliveryNumber: `${createdRoute.routeNumber}-${index + 1}`,
              orderId: order.id,
              routeId: createdRoute.id,
              sequence: index + 1,
              status: "PENDING",
            },
          }),
        ));
        await tx.order.updateMany({ where: { id: { in: orders.map((order) => order.id) } }, data: { status: "ASSIGNED" } });
      }

      return tx.route.findUniqueOrThrow({
        where: { id: createdRoute.id },
        include: { driver: true, vehicle: true, deliveries: { include: { order: true }, orderBy: { sequence: "asc" } } },
      });
    });

    return NextResponse.json({ ok: true, route }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Trasa albo dostawa o takim numerze już istnieje lub zamówienie jest już w dostawie." }, { status: 409 });
    }
    console.error("Route creation failed", error);
    return NextResponse.json({ ok: false, error: "Nie udało się zapisać trasy." }, { status: 500 });
  }
}
