import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const roles = ["ADMIN", "DISPATCHER", "DRIVER"] as const;

type Role = (typeof roles)[number];

const userSelect = {
  id: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
  dispatcherStatus: true,
  createdAt: true,
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeRole(value: unknown): Role | null {
  const role = clean(value).toUpperCase();
  return roles.includes(role as Role) ? (role as Role) : null;
}

function getPrismaErrorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Użytkownik z tym adresem email już istnieje." },
        { status: 409 },
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Nie znaleziono użytkownika o podanym identyfikatorze." },
        { status: 404 },
      );
    }
  }

  return NextResponse.json({ message: fallbackMessage }, { status: 500 });
}

function getUserWriteData(firstName: string, lastName: string, email: string, role: Role) {
  return {
    firstName,
    lastName,
    email,
    role: role as UserRole,
    dispatcherStatus: role === "DISPATCHER" ? "AVAILABLE" : "OFFLINE",
  } satisfies Prisma.UserCreateInput | Prisma.UserUpdateInput;
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: [{ role: "asc" }, { lastName: "asc" }, { firstName: "asc" }, { createdAt: "desc" }],
      select: userSelect,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("ADMIN_USERS_GET_ERROR:", error);
    return getPrismaErrorResponse(error, "Nie udało się pobrać użytkowników.");
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ message: "Nieprawidłowy format JSON." }, { status: 400 });
  }

  const firstName = clean(body.firstName);
  const lastName = clean(body.lastName);
  const email = clean(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const role = normalizeRole(body.role);

  if (!firstName || !lastName || !email || !password || !role) {
    return NextResponse.json({ message: "Uzupełnij wszystkie wymagane pola." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ message: "Hasło musi mieć minimum 8 znaków." }, { status: 400 });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Użytkownik z tym adresem email już istnieje." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        ...getUserWriteData(firstName, lastName, email, role),
        passwordHash,
        password,
      },
      select: userSelect,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("ADMIN_USER_CREATE_ERROR:", error);
    return getPrismaErrorResponse(error, "Nie udało się dodać użytkownika.");
  }
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ message: "Nieprawidłowy format JSON." }, { status: 400 });
  }

  const id = clean(body.id);
  const firstName = clean(body.firstName);
  const lastName = clean(body.lastName);
  const email = clean(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const role = normalizeRole(body.role);

  if (!id) {
    return NextResponse.json({ message: "Brak identyfikatora użytkownika." }, { status: 400 });
  }

  if (!firstName || !lastName || !email || !role) {
    return NextResponse.json({ message: "Uzupełnij wszystkie wymagane pola edycji." }, { status: 400 });
  }

  if (password && password.length < 8) {
    return NextResponse.json({ message: "Nowe hasło musi mieć minimum 8 znaków." }, { status: 400 });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { email, NOT: { id } },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Inny użytkownik korzysta już z tego adresu email." }, { status: 409 });
    }

    const updateData: Prisma.UserUpdateInput = getUserWriteData(firstName, lastName, email, role);

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
      updateData.password = password;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelect,
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("ADMIN_USER_UPDATE_ERROR:", error);
    return getPrismaErrorResponse(error, "Nie udało się zaktualizować użytkownika.");
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = clean(searchParams.get("id"));

  if (!id) {
    return NextResponse.json({ message: "Brak identyfikatora użytkownika." }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: "Użytkownik został usunięty." });
  } catch (error) {
    console.error("ADMIN_USER_DELETE_ERROR:", error);
    return getPrismaErrorResponse(error, "Nie udało się usunąć użytkownika.");
  }
}
