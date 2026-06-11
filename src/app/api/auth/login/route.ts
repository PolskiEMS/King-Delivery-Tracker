import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function getRedirectByRole(role: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "DISPATCHER") return "/dispatcher";
  if (role === "DRIVER") return "/driver";

  return "/";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Podaj email i hasło." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Nieprawidłowy email lub hasło." },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      return NextResponse.json(
        { ok: false, message: "Nieprawidłowy email lub hasło." },
        { status: 401 }
      );
    }

    const redirectTo = getRedirectByRole(user.role);

    return NextResponse.json({
      ok: true,
      redirectTo,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN_ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Wystąpił błąd logowania.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}