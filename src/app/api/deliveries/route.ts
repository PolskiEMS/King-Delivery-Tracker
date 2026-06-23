import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  const deliveries = await prisma.delivery.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: true, route: { include: { driver: true, vehicle: true } } },
  });
  return NextResponse.json({ ok: true, deliveries });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "Nieprawidłowy format JSON." }, { status: 400 });
  }

  const id = clean(body.id);
  const status = clean(body.status);
  const receiverName = clean(body.receiverName);

  if (!id) {
    return NextResponse.json({ ok: false, error: "Brak identyfikatora dostawy." }, { status: 400 });
  }

  if (status !== "DELIVERED" && status !== "IN_PROGRESS" && status !== "PROBLEM") {
    return NextResponse.json({ ok: false, error: "Nieprawidłowy status dostawy." }, { status: 400 });
  }

  if (status === "DELIVERED" && !receiverName) {
    return NextResponse.json({ ok: false, error: "Imię i nazwisko odbiorcy jest wymagane." }, { status: 400 });
  }

  try {
    const delivery = await prisma.delivery.update({
      where: { id },
      data: {
        status,
        deliveredAt: status === "DELIVERED" ? new Date() : null,
        problemNote: status === "PROBLEM" ? clean(body.problemNote) || "Problem zgłoszony przez kierowcę." : null,
      },
      include: { order: true, route: { include: { driver: true, vehicle: true } } },
    });

    if (status === "DELIVERED") {
      await prisma.order.update({ where: { id: delivery.orderId }, data: { status: "DELIVERED" } });
    }

    if (status === "IN_PROGRESS") {
      await prisma.order.update({ where: { id: delivery.orderId }, data: { status: "IN_DELIVERY" } });
    }

    return NextResponse.json({ ok: true, delivery });
  } catch (error) {
    console.error("Delivery update failed", error);
    return NextResponse.json({ ok: false, error: "Nie udało się zaktualizować dostawy." }, { status: 500 });
  }
}
