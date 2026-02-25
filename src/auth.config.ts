import type { NextAuthConfig } from 'next-auth';

// Lightweight auth config that is safe to use in the Edge runtime (middleware).
// Does NOT import Prisma or bcrypt — only reads the JWT session cookie.
export const authConfig: NextAuthConfig = {
    providers: [], // No providers needed for Edge — credential validation happens server-side
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
            }
            return session;
        },
    },
    pages: { signIn: '/login' },
};
