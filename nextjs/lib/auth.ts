import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-google-client-secret",
    }),
    CredentialsProvider({
      name: "Developer Mode",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "dev@ecopulse.org" },
      },
      async authorize(credentials) {
        if (credentials?.email) {
          // Allow any dev login out-of-the-box
          const username = credentials.email.split("@")[0];
          return {
            id: `dev-${username}`,
            name: username.charAt(0).toUpperCase() + username.slice(1) + " (Dev)",
            email: credentials.email,
            image: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
          };
        }
        return null;
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
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "ecopulse-secret-987654321-development",
};
