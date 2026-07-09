import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const { pathname } = req.nextUrl;
  const isLedgerRoute = pathname.startsWith('/ledger');
  const isErpRoute = pathname.startsWith('/app');
  const isLoginPage = pathname === '/ledger/login';

  // Protect both the ledger and the ERP; share the same login page.
  if ((isLedgerRoute || isErpRoute) && !isLoginPage && !isLoggedIn) {
    const url = new URL('/ledger/login', req.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  if (isLoginPage && isLoggedIn) {
    const role = req.auth?.user?.role;
    const home = role === 'PARTNER' ? '/ledger' : '/app';
    return NextResponse.redirect(new URL(home, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/ledger/:path*', '/app/:path*'],
};
