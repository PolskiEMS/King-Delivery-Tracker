import { NextRequest, NextResponse } from "next/server";
import {
  getRoleHome,
  SESSION_COOKIE_NAME,
  type SessionRole,
  verifySessionToken,
} from "@/lib/session-token";

const pageRules: Array<{ prefix: string; roles: SessionRole[] }> = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/dispatcher", roles: ["DISPATCHER"] },
  { prefix: "/driver", roles: ["DRIVER"] },
];

const apiRules: Array<{ prefix: string; roles: SessionRole[] }> = [
  { prefix: "/api/admin", roles: ["ADMIN"] },
  { prefix: "/api/dispatchers", roles: ["ADMIN", "DISPATCHER"] },
  { prefix: "/api/orders", roles: ["ADMIN", "DISPATCHER"] },
  { prefix: "/api/deliveries", roles: ["ADMIN", "DISPATCHER"] },
  { prefix: "/api/routes", roles: ["ADMIN", "DISPATCHER"] },
  { prefix: "/api/vehicles", roles: ["ADMIN", "DISPATCHER"] },
  { prefix: "/api/drivers", roles: ["ADMIN", "DISPATCHER"] },
];

function matchRule(pathname: string, rules: Array<{ prefix: string; roles: SessionRole[] }>) {
  return rules.find((rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`));
}

function clearInvalidSession(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pageRule = matchRule(pathname, pageRules);
  const apiRule = matchRule(pathname, apiRules);

  if (!pageRule && !apiRule) return NextResponse.next();

  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    if (apiRule) {
      return clearInvalidSession(
        NextResponse.json({ ok: false, message: "Sesja wygasła lub jest nieprawidłowa." }, { status: 401 }),
      );
    }

    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("reason", "session");
    return clearInvalidSession(NextResponse.redirect(loginUrl));
  }

  const rule = pageRule ?? apiRule;
  if (rule && !rule.roles.includes(session.role)) {
    if (apiRule) {
      return NextResponse.json({ ok: false, message: "Brak uprawnień do tej operacji." }, { status: 403 });
    }

    return NextResponse.redirect(new URL(getRoleHome(session.role), request.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("x-frame-options", "DENY");
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dispatcher/:path*",
    "/driver/:path*",
    "/api/admin/:path*",
    "/api/dispatchers/:path*",
    "/api/orders/:path*",
    "/api/deliveries/:path*",
    "/api/routes/:path*",
    "/api/vehicles/:path*",
    "/api/drivers/:path*",
  ],
};
