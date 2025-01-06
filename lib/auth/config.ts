import { NextAuthOptions } from "next-auth";
import { DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Resend } from 'resend';

// Extend the built-in session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"]
  }
}

// Initialize Resend for email
const resend = new Resend(process.env.RESEND_API_KEY);

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      from: process.env.RESEND_FROM!,
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { from },
      }) {
        try {
          const result = await resend.emails.send({
            from: from,
            to: email,
            subject: "Sign in to AI tutor",
            html: `
              <div>
                <h1>Sign in to AI tutor</h1>
                <p>Click the link below to sign in to your account:</p>
                <a href="${url}">Sign in</a>
                <p>If you didn't request this email, you can safely ignore it.</p>
              </div>
            `,
          });

          if (result.error) {
            throw new Error(result.error.message);
          }
        } catch (error) {
          console.error("Error sending verification email", error);
          throw new Error("Failed to send verification email");
        }
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
      if (session?.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user }) {
      if (user) {
        return true;
      }
      return false;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Separate authorization check function
export const authorizationCheck = ({ 
  auth, 
  request: { nextUrl } 
}: { 
  auth: { user: any } | null; 
  request: { nextUrl: URL } 
}) => {
  const isLoggedIn = !!auth?.user;
  const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
  
  if (isOnDashboard) {
    if (isLoggedIn) return true;
    return false;
  } else if (isLoggedIn) {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }
  return true;
};