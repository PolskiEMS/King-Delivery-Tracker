import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findAuthUserByEmail } from "@/lib/auth-users";

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

    const user = await findAuthUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Nieprawidłowy email lub hasło." },
        { status: 401 }
      );
    }

    const redirectTo = getRedirectByRole(user.role);

    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      return NextResponse.json(
        { ok: false, message: "Nieprawidłowy email lub hasło." },
        { status: 401 }
      );
    }

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