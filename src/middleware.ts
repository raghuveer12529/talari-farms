import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const role = (req.auth?.user as any)?.role;

    const isAdminPath = nextUrl.pathname.startsWith('/admin');
    const isExpensePath = nextUrl.pathname.startsWith('/admin/expenses');
    const isLoginPage = nextUrl.pathname === '/login';

    if (isLoginPage && isLoggedIn) {
        return NextResponse.redirect(new URL(role === 'CUSTOMER' ? '/' : '/admin', nextUrl));
    }

    if (isAdminPath) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL('/login', nextUrl));
        }

        if (role === 'CUSTOMER') {
            return NextResponse.redirect(new URL('/', nextUrl));
        }

        if (role === 'PARTNER' && !isExpensePath && nextUrl.pathname !== '/admin') {
            // Partners can only see dashboard (summary) and expenses
            if (nextUrl.pathname !== '/admin') {
                return NextResponse.redirect(new URL('/admin/expenses', nextUrl));
            }
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/admin/:path*', '/login'],
};
