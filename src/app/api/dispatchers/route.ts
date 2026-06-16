import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const dispatcherStatuses = ["AVAILABLE", "BUSY", "AWAY", "OFFLINE"] as const;
type DispatcherStatus = (typeof dispatcherStatuses)[number];

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isDispatcherStatus(value: unknown): value is DispatcherStatus {
  return typeof value === "string" && dispatcherStatuses.includes(value as DispatcherStatus);
}

export async function GET() {
  const dispatchers = await prisma.user.findMany({
    where: { role: "DISPATCHER" },
    orderBy: [{ dispatcherStatus: "asc" }, { firstName: "asc" }, { lastName: "asc" }],
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      dispatcherStatus: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, dispatchers });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "Nieprawidłowy format JSON." }, { status: 400 });
  }

  const id = clean(body.id);

  if (!id) {
    return NextResponse.json({ ok: false, error: "Brak identyfikatora dyspozytora." }, { status: 400 });
  }

  if (!isDispatcherStatus(body.dispatcherStatus)) {
    return NextResponse.json({ ok: false, error: "Nieprawidłowy status dyspozytora." }, { status: 400 });
  }

  try {
    const result = await prisma.user.updateMany({
      where: { id, role: "DISPATCHER" },
      data: { dispatcherStatus: body.dispatcherStatus },
    });

    if (result.count === 0) {
      return NextResponse.json({ ok: false, error: "Nie znaleziono dyspozytora." }, { status: 404 });
    }

    const dispatcher = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dispatcherStatus: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, dispatcher });
  } catch (error) {
    console.error("Dispatcher status update failed", error);
    return NextResponse.json({ ok: false, error: "Nie udało się zmienić statusu dyspozytora." }, { status: 500 });
  }
}
