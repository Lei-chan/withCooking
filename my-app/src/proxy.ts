import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  console.log("proxy");
  const pathname = req.nextUrl.pathname;

  //If path already has a locale => do nothing
  const hasLocale = pathname.startsWith("/en") || pathname.startsWith("/ja");

  if (hasLocale) return NextResponse.next();

  //Detect user's preferred language
  const acceptLanguage = req.headers.get("accept-language") || "";
  const locale = acceptLanguage.includes("ja") ? "ja" : "en";

  //Redirect root to locale
  return NextResponse.redirect(new URL(`/${locale}${pathname}`, req.url));
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
