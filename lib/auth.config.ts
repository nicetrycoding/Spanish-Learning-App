import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config (no Prisma / bcrypt here — those require the
 * Node runtime). This is what `middleware.ts` runs on every request; the
 * Credentials provider itself lives in `lib/auth.ts`, which is only ever
 * imported from Node-runtime code (server actions, route handlers).
 */
export const authConfig = {
  // Required for self-hosted deployments (not on Vercel, which sets this
  // automatically) — trusts the Host header from your own reverse proxy.
  // See https://errors.authjs.dev#untrustedhost.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const protectedPrefixes = [
        "/dashboard",
        "/onboarding",
        "/placement-test",
        "/learn",
        "/practice",
        "/vocabulary",
        "/grammar",
        "/listening",
        "/speaking",
        "/writing",
        "/conversation",
        "/stories",
        "/mistakes",
        "/progress",
        "/settings",
        "/tutor",
        "/real-world",
        "/assessments",
        "/import",
      ];

      const isProtected = protectedPrefixes.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`),
      );

      if (isProtected) return isLoggedIn;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
