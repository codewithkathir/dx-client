import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import {
  ADMIN_PROTECTED_PREFIX,
  ADMIN_ROUTES,
  PUBLIC_ROUTES,
  USER_PROTECTED_PREFIX,
  USER_ROUTES,
} from '@/constants/routes.constants';

const ADMIN_SESSION_COOKIE = 'dx_admin_session';
const USER_SESSION_COOKIE = 'dx_user_session';

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isAdminProtected(pathname: string): boolean {
  return (
    pathname.startsWith(ADMIN_PROTECTED_PREFIX) &&
    !pathname.startsWith(ADMIN_ROUTES.LOGIN) &&
    pathname !== ADMIN_ROUTES.FORGOT_PASSWORD &&
    !pathname.startsWith(`${ADMIN_ROUTES.RESET_PASSWORD}`)
  );
}

function isUserProtected(pathname: string): boolean {
  return pathname.startsWith(USER_PROTECTED_PREFIX);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminSession = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const userSession = request.cookies.get(USER_SESSION_COOKIE)?.value;

  if (isPublicRoute(pathname)) {
    if (pathname === ADMIN_ROUTES.LOGIN && adminSession) {
      return NextResponse.redirect(new URL(ADMIN_ROUTES.DASHBOARD, request.url));
    }
    if (pathname === USER_ROUTES.LOGIN && userSession) {
      return NextResponse.redirect(new URL(USER_ROUTES.HOME, request.url));
    }
    return NextResponse.next();
  }

  if (isAdminProtected(pathname) && !adminSession) {
    const loginUrl = new URL(ADMIN_ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isUserProtected(pathname) && !userSession) {
    const loginUrl = new URL(USER_ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
