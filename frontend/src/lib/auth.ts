import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const res = await fetch("http://localhost:8000/api/v1/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              username: credentials.email,
              password: credentials.password,
            }),
          });

          if (res.ok) {
            const user = await res.json();
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              accessToken: user.access_token,
            };
          }
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        if (account.provider === "google") {
          try {
            const res = await fetch("http://localhost:8000/api/v1/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                name: user.name
              }),
            });
            if (res.ok) {
              const backendUser = await res.json();
              token.sub = backendUser.id;
              token.accessToken = backendUser.access_token;
            }
          } catch (error) {
            console.error("Error syncing Google user with backend:", error);
          }
        } else {
          token.sub = user.id;
          token.accessToken = (user as any).accessToken;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_only_2026"
}

