import NextAuth, { NextAuthOptions } from "next-auth";
import TodoistProvider from "next-auth/providers/todoist";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET must be set in environment variables");
}

if (!process.env.TODOIST_CLIENT_ID) {
  throw new Error("TODOIST_CLIENT_ID must be set in environment variables");
}

if (!process.env.TODOIST_CLIENT_SECRET) {
  throw new Error("TODOIST_CLIENT_SECRET must be set in environment variables");
}

if (!process.env.NEXTAUTH_URL) {
  throw new Error("NEXTAUTH_URL must be set in environment variables");
}

export const authOptions: NextAuthOptions = {
  providers: [
    TodoistProvider({
      clientId: process.env.TODOIST_CLIENT_ID!,
      clientSecret: process.env.TODOIST_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "data:read",
        },
      },
      userinfo: {
        async request({ tokens }) {
          const response = await fetch("https://api.todoist.com/api/v1/user", {
            headers: {
              Authorization: 	tokens.access_token ? `Bearer ${tokens.access_token}` : "",
            },
          });

          if (!response.ok) {
            const body = await response.text();
            throw new Error(`Todoist userinfo failed (${response.status}): ${body}`);
          }

          return response.json();
        },
      },
      profile(profile: any) {
        return {
          id: String(profile.id),
          email: profile.email,
          name: profile.full_name ?? profile.name ?? profile.email,
          image: profile.avatar_big ?? profile.avatar_medium ?? profile.avatar_s640 ?? null,
        };
      },
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30,
  },
  callbacks: {
    async jwt({ token, account }): Promise<JWT> {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session }): Promise<Session> {
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
};

export default NextAuth(authOptions);
