import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import prisma from './db';
import type { AdminRole } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: AdminRole;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: AdminRole;
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: AdminRole;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const admin = await prisma.admin.findUnique({
          where: { email },
        });

        if (!admin || !admin.isActive) {
          return null;
        }

        const passwordValid = await compare(password, admin.password);

        if (!passwordValid) {
          return null;
        }

        // Update last login
        await prisma.admin.update({
          where: { id: admin.id },
          data: {
            lastLoginAt: new Date(),
          },
        });

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
});
