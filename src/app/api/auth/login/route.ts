import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const roleRedirects = {
  ADMIN: "/admin",
  DISPATCHER: "/dispatcher",
  DRIVER: "/driver",
} as const;

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

    const redirectTo = roleRedirects[user.role];

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
    console.error(error);

    return NextResponse.json(
      { ok: false, message: "Wystąpił błąd logowania." },
      { status: 500 }
    );
  }
}