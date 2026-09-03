import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  // Skip static assets, images, and API auth routes.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/).*)"],
};
