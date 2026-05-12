import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "ap_did";
const ONE_YEAR = 60 * 60 * 24 * 365;

function newDeviceId(): string {
  return crypto.randomUUID();
}

export function proxy(request: NextRequest) {
  const existing = request.cookies.get(COOKIE_NAME);
  if (existing?.value) return NextResponse.next();

  const response = NextResponse.next();
  response.cookies.set({
    name: COOKIE_NAME,
    value: newDeviceId(),
    path: "/",
    maxAge: ONE_YEAR * 2,
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|figures/|robots.txt|sitemap.xml).*)",
  ],
};
