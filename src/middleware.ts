// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const pathname = request.nextUrl.pathname;

  if (!token && pathname !== '/login') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (token && pathname === '/login') {
    const redirect = request.nextUrl.searchParams.get('redirect') || '/';
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/orders(.*)',
    '/products(.*)',
    '/stats(.*)',
    '/users(.*)',
    '/login',
   
  ],
};