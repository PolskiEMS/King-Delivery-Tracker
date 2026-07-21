import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session-token";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);

  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  response.headers.set("cache-control", "no-store");

  return response;
}
