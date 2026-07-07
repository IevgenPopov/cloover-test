import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { seedDemoUser, verifyUser } from "@/app/lib/auth-store";

void seedDemoUser().catch(() => undefined);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? "cloover-dev-secret",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        return verifyUser(email, password);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
      async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? token.sub ?? session.user.id;
      }

      return session;
    },
  }
};
