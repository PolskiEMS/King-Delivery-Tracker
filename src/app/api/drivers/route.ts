import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAdminEvent } from "@/lib/admin-events";

export const dynamic = "force-dynamic";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  const drivers = await prisma.driver.findMany({ orderBy: { createdAt: "desc" }, include: { createdBy: true, updatedBy: true, routes: true } });
  return NextResponse.json({ ok: true, drivers });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "Nieprawidłowy format JSON." }, { status: 400 });
  }

  const firstName = clean(body.firstName);
  const lastName = clean(body.lastName);
  const actorId = clean(body.actorId) || null;

  if (!firstName || !lastName) {
    return NextResponse.json({ ok: false, error: "Pola firstName i lastName są wymagane." }, { status: 400 });
  }

  try {
    const driver = await prisma.driver.create({
      data: { firstName, lastName, phone: clean(body.phone) || null, active: body.active === false ? false : true, createdById: actorId },
      include: { createdBy: true, updatedBy: true, routes: true },
    });
    await createAdminEvent({
      type: "DRIVER_CREATED",
      title: `Utworzono kierowcę ${driver.firstName} ${driver.lastName}`,
      description: "Dodano kierowcę do bazy operacyjnej.",
      entityType: "Driver",
      entityId: driver.id,
      actorId,
    });
    return NextResponse.json({ ok: true, driver }, { status: 201 });
  } catch (error) {
    console.error("Driver creation failed", error);
    return NextResponse.json({ ok: false, error: "Nie udało się zapisać kierowcy." }, { status: 500 });
  }
}


export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "Nieprawidłowy format JSON." }, { status: 400 });
  }

  const id = clean(body.id);
  const firstName = clean(body.firstName);
  const lastName = clean(body.lastName);
  const actorId = clean(body.actorId) || null;

  if (!id) {
    return NextResponse.json({ ok: false, error: "Brak identyfikatora kierowcy." }, { status: 400 });
  }

  if (!firstName || !lastName) {
    return NextResponse.json({ ok: false, error: "Pola firstName i lastName są wymagane." }, { status: 400 });
  }

  try {
    const driver = await prisma.driver.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phone: clean(body.phone) || null,
        active: body.active === false ? false : true,
        updatedById: actorId,
      },
      include: { createdBy: true, updatedBy: true, routes: true },
    });
    await createAdminEvent({
      type: "DRIVER_UPDATED",
      title: `Zaktualizowano kierowcę ${driver.firstName} ${driver.lastName}`,
      description: "Zmieniono dane kierowcy.",
      entityType: "Driver",
      entityId: driver.id,
      actorId,
    });
    return NextResponse.json({ ok: true, driver });
  } catch (error) {
    console.error("Driver update failed", error);
    return NextResponse.json({ ok: false, error: "Nie udało się zaktualizować kierowcy." }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = clean(searchParams.get("id"));
  const actorId = clean(searchParams.get("actorId")) || null;

  if (!id) {
    return NextResponse.json({ ok: false, error: "Brak identyfikatora kierowcy." }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.route.updateMany({ where: { driverId: id }, data: { driverId: null } });
      await tx.driver.delete({ where: { id } });
    });

    await createAdminEvent({
      type: "DRIVER_DELETED",
      title: "Usunięto kierowcę",
      description: `Usunięto kierowcę o ID ${id}.`,
      entityType: "Driver",
      entityId: id,
      actorId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Driver deletion failed", error);
    return NextResponse.json({ ok: false, error: "Nie udało się usunąć kierowcy." }, { status: 500 });
  }
}
