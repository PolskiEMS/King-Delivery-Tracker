import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  getRoleHome,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  type SessionRole,
} from "@/lib/session-token";

function isSessionRole(role: string): role is SessionRole {
  return role === "ADMIN" || role === "DISPATCHER" || role === "DRIVER";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ ok: false, message: "Podaj email i hasło." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
        role: true,
      },
    });

    const passwordValid = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !passwordValid || !isSessionRole(user.role)) {
      return NextResponse.json(
        { ok: false, message: "Nieprawidłowy email lub hasło." },
        { status: 401 },
      );
    }

    const token = await createSessionToken(user.id, user.role);
    const response = NextResponse.json({
      ok: true,
      redirectTo: getRoleHome(user.role),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    response.headers.set("cache-control", "no-store");

    return response;
  } catch (error) {
    console.error("LOGIN_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Wystąpił błąd logowania." },
      { status: 500 },
    );
  }
}
