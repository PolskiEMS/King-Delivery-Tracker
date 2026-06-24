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

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "Nieprawidłowy format JSON." }, { status: 400 });
  }

  const id = clean(body.id);
  const routeNumber = clean(body.routeNumber);
  const name = clean(body.name);

  if (!id) {
    return NextResponse.json({ ok: false, error: "Brak identyfikatora trasy." }, { status: 400 });
  }

  if (!routeNumber || !name) {
    return NextResponse.json({ ok: false, error: "Pola routeNumber i name są wymagane." }, { status: 400 });
  }

  try {
    const route = await prisma.route.update({
      where: { id },
      data: {
        routeNumber,
        name,
        plannedDate: clean(body.plannedDate) ? new Date(clean(body.plannedDate)) : null,
        driverId: clean(body.driverId) || null,
        vehicleId: clean(body.vehicleId) || null,
        notes: clean(body.notes) || null,
      },
      include: { driver: true, vehicle: true, deliveries: { include: { order: true }, orderBy: { sequence: "asc" } } },
    });

    return NextResponse.json({ ok: true, route });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Trasa o takim numerze już istnieje." }, { status: 409 });
    }
    console.error("Route update failed", error);
    return NextResponse.json({ ok: false, error: "Nie udało się zaktualizować trasy." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = clean(searchParams.get("id"));

  if (!id) {
    return NextResponse.json({ ok: false, error: "Brak identyfikatora trasy." }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const route = await tx.route.findUnique({
        where: { id },
        include: { deliveries: { select: { id: true, orderId: true } } },
      });

      if (!route) {
        throw new Error("ROUTE_NOT_FOUND");
      }

      const orderIds = route.deliveries.map((delivery) => delivery.orderId);

      if (route.deliveries.length > 0) {
        await tx.delivery.deleteMany({ where: { routeId: id } });
      }

      if (orderIds.length > 0) {
        await tx.order.updateMany({
          where: { id: { in: orderIds } },
          data: { status: "NEW" },
        });
      }

      await tx.route.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "ROUTE_NOT_FOUND") {
      return NextResponse.json({ ok: false, error: "Nie znaleziono trasy." }, { status: 404 });
    }

    console.error("Route deletion failed", error);
    return NextResponse.json({ ok: false, error: "Nie udało się usunąć trasy." }, { status: 500 });
  }
}
