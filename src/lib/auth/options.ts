import "server-only";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { isApprovedAdminEmail } from "./allowlist";

export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export function isGoogleSignInConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.NEXTAUTH_SECRET &&
    process.env.ADMIN_ALLOWED_EMAILS,
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SECONDS },
  jwt: { maxAge: SESSION_MAX_AGE_SECONDS },
  pages: { signIn: "/admin/login", error: "/admin/login" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (!isGoogleSignInConfigured() || account?.provider !== "google") {
        return false;
      }
      const googleProfile = profile as
        { email?: string; email_verified?: boolean } | undefined;
      return (
        googleProfile?.email_verified === true &&
        isApprovedAdminEmail(googleProfile.email)
      );
    },
  },
};
