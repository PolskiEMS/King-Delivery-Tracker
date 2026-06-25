import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type OrderPayload = {
  orderNumber?: unknown;
  customerName?: unknown;
  address?: unknown;
  city?: unknown;
  postalCode?: unknown;
  country?: unknown;
  goodsName?: unknown;
  quantity?: unknown;
  unit?: unknown;
  pallets?: unknown;
  weightKg?: unknown;
  notes?: unknown;
};

const requiredFields = [
  "orderNumber",
  "customerName",
  "address",
  "city",
  "goodsName",
  "quantity",
] as const;

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalString(value: unknown) {
  const text = cleanString(value);
  return text.length > 0 ? text : null;
}

function optionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function getValidationErrors(payload: OrderPayload) {
  const missingFields = requiredFields.filter((field) => {
    if (field === "quantity") {
      return (
        payload.quantity === null ||
        payload.quantity === undefined ||
        payload.quantity === ""
      );
    }

    return cleanString(payload[field]).length === 0;
  });

  const errors: string[] = [];

  if (missingFields.length > 0) {
    errors.push(`Brak wymaganych pól: ${missingFields.join(", ")}.`);
  }

  const quantity = Number(payload.quantity);

  if (
    payload.quantity !== null &&
    payload.quantity !== undefined &&
    payload.quantity !== "" &&
    !Number.isFinite(quantity)
  ) {
    errors.push("Pole quantity musi być liczbą.");
  }

  const pallets = optionalNumber(payload.pallets);
  if (
    payload.pallets !== null &&
    payload.pallets !== undefined &&
    payload.pallets !== ""
  ) {
    if (pallets === null || !Number.isInteger(pallets)) {
      errors.push("Pole pallets musi być liczbą całkowitą.");
    }
  }

  const weightKg = optionalNumber(payload.weightKg);
  if (
    payload.weightKg !== null &&
    payload.weightKg !== undefined &&
    payload.weightKg !== "" &&
    weightKg === null
  ) {
    errors.push("Pole weightKg musi być liczbą.");
  }

  return errors;
}

async function authorizeOrdersRequest() {
  // Placeholder for future dispatcher/admin authorization.
  return { ok: true };
}

export async function GET() {
  const authorization = await authorizeOrdersRequest();

  if (!authorization.ok) {
    return NextResponse.json(
      { ok: false, error: "Brak dostępu do listy zamówień." },
      { status: 401 },
    );
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, orders });
}

export async function POST(request: Request) {
  const authorization = await authorizeOrdersRequest();

  if (!authorization.ok) {
    return NextResponse.json(
      { ok: false, error: "Brak dostępu do tworzenia zamówień." },
      { status: 401 },
    );
  }

  let payload: OrderPayload;

  try {
    const body = (await request.json()) as unknown;

    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { ok: false, error: "Treść żądania musi być obiektem JSON." },
        { status: 400 },
      );
    }

    payload = body as OrderPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Nieprawidłowy format JSON." },
      { status: 400 },
    );
  }

  const validationErrors = getValidationErrors(payload);

  if (validationErrors.length > 0) {
    return NextResponse.json(
      { ok: false, error: validationErrors.join(" ") },
      { status: 400 },
    );
  }

  const quantity = Number(payload.quantity);
  const pallets = optionalNumber(payload.pallets);
  const weightKg = optionalNumber(payload.weightKg);

  try {
    const order = await prisma.order.create({
      data: {
        orderNumber: cleanString(payload.orderNumber),
        customerName: cleanString(payload.customerName),
        address: cleanString(payload.address),
        city: cleanString(payload.city),
        postalCode: optionalString(payload.postalCode),
        country: cleanString(payload.country) || "UK",
        goodsName: cleanString(payload.goodsName),
        quantity,
        unit: cleanString(payload.unit) || "szt.",
        pallets: pallets === null ? null : pallets,
        weightKg,
        notes: optionalString(payload.notes),
        status: "NEW",
      },
    });

    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Zamówienie o takim numerze już istnieje.",
        },
        { status: 409 },
      );
    }

    console.error("Order creation failed", error);

    return NextResponse.json(
      { ok: false, error: "Nie udało się zapisać zamówienia." },
      { status: 500 },
    );
  }
}


export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as (OrderPayload & { id?: unknown }) | null;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "Nieprawidłowy format JSON." }, { status: 400 });
  }

  const id = cleanString(body.id);
  if (!id) {
    return NextResponse.json({ ok: false, error: "Brak identyfikatora zamówienia." }, { status: 400 });
  }

  const validationErrors = getValidationErrors(body);
  if (validationErrors.length > 0) {
    return NextResponse.json({ ok: false, error: validationErrors.join(" ") }, { status: 400 });
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: {
        orderNumber: cleanString(body.orderNumber),
        customerName: cleanString(body.customerName),
        address: cleanString(body.address),
        city: cleanString(body.city),
        postalCode: optionalString(body.postalCode),
        country: cleanString(body.country) || "UK",
        goodsName: cleanString(body.goodsName),
        quantity: Number(body.quantity),
        unit: cleanString(body.unit) || "szt.",
        pallets: optionalNumber(body.pallets),
        weightKg: optionalNumber(body.weightKg),
        notes: optionalString(body.notes),
      },
    });

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Zamówienie o takim numerze już istnieje." }, { status: 409 });
    }
    console.error("Order update failed", error);
    return NextResponse.json({ ok: false, error: "Nie udało się zaktualizować zamówienia." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = cleanString(searchParams.get("id"));

  if (!id) {
    return NextResponse.json({ ok: false, error: "Brak identyfikatora zamówienia." }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.delivery.deleteMany({ where: { orderId: id } });
      await tx.order.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Order deletion failed", error);
    return NextResponse.json({ ok: false, error: "Nie udało się usunąć zamówienia." }, { status: 500 });
  }
}
