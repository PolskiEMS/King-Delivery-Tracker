import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function normalizeRole(role: string) {
  const value = role.toUpperCase();

  if (value === "DISPATCHER") return "DISPATCHER";
  if (value === "DRIVER") return "DRIVER";

  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    const role = normalizeRole(String(body.role || ""));

    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json(
        { ok: false, message: "Uzupełnij wszystkie wymagane pola." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, message: "Hasło musi mieć minimum 8 znaków." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { ok: false, message: "Użytkownik z tym adresem email już istnieje." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        role,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Konto zostało utworzone.",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("REGISTER_ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Wystąpił błąd podczas rejestracji.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}