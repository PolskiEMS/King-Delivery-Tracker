import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const roles = ["ADMIN", "DISPATCHER", "DRIVER"] as const;

type Role = (typeof roles)[number];

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeRole(value: unknown): Role | null {
  const role = clean(value).toUpperCase();
  return roles.includes(role as Role) ? (role as Role) : null;
}

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  dispatcherStatus: true,
  createdAt: true,
};

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { firstName: "asc" }, { lastName: "asc" }],
    select: userSelect,
  });

  return NextResponse.json({ ok: true, users });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ ok: false, message: "Nieprawidłowy format JSON." }, { status: 400 });
  }

  const firstName = clean(body.firstName);
  const lastName = clean(body.lastName);
  const email = clean(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const role = normalizeRole(body.role);

  if (!firstName || !lastName || !email || !password || !role) {
    return NextResponse.json({ ok: false, message: "Uzupełnij wszystkie wymagane pola." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ ok: false, message: "Hasło musi mieć minimum 8 znaków." }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json({ ok: false, message: "Użytkownik z tym adresem email już istnieje." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      role: role as UserRole,
    },
    select: userSelect,
  });

  return NextResponse.json({ ok: true, message: "Użytkownik został dodany.", user }, { status: 201 });
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ ok: false, message: "Nieprawidłowy format JSON." }, { status: 400 });
  }

  const id = clean(body.id);
  const firstName = clean(body.firstName);
  const lastName = clean(body.lastName);
  const email = clean(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const role = normalizeRole(body.role);

  if (!id || !firstName || !lastName || !email || !role) {
    return NextResponse.json({ ok: false, message: "Uzupełnij wszystkie wymagane pola edycji." }, { status: 400 });
  }

  if (password && password.length < 8) {
    return NextResponse.json({ ok: false, message: "Nowe hasło musi mieć minimum 8 znaków." }, { status: 400 });
  }

  const existingUser = await prisma.user.findFirst({
    where: { email, NOT: { id } },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.json({ ok: false, message: "Inny użytkownik korzysta już z tego adresu email." }, { status: 409 });
  }

  const updateData: Prisma.UserUpdateInput = {
    firstName,
    lastName,
    email,
    role: role as UserRole,
  };

  if (role !== "DISPATCHER") {
    updateData.dispatcherStatus = "OFFLINE";
  }

  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelect,
    });

    return NextResponse.json({ ok: true, message: "Użytkownik został zaktualizowany.", user });
  } catch (error) {
    console.error("ADMIN_USER_UPDATE_ERROR:", error);
    return NextResponse.json({ ok: false, message: "Nie udało się zaktualizować użytkownika." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = clean(searchParams.get("id"));

  if (!id) {
    return NextResponse.json({ ok: false, message: "Brak identyfikatora użytkownika." }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: "Użytkownik został usunięty." });
  } catch (error) {
    console.error("ADMIN_USER_DELETE_ERROR:", error);
    return NextResponse.json({ ok: false, message: "Nie udało się usunąć użytkownika." }, { status: 500 });
  }
}
