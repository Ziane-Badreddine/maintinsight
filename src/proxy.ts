import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const hasCompletedOnboarding = Boolean(session.user.name?.trim());

  if (!hasCompletedOnboarding && request.nextUrl.pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (hasCompletedOnboarding && request.nextUrl.pathname === "/onboarding") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const roles = session.user.role?.split(",") ?? [];

  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !roles.includes("admin")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/onboarding"],
};
