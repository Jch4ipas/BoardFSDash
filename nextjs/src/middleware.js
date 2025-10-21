import NextAuth from 'next-auth';
import { authConfig } from '../auth.config';
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const ALLOWED_NETWORKS = [
  /^128\.179\./,      // Réseau EPFL ETHERNET
  /^128\.178\./,      // Réseau EPFL WIFI
  /^127\.0\.0\.1$/,   // Localhost IPv4
  /^::1$/             // Localhost IPv6
];

// export default NextAuth(authConfig).auth;

export default async function middleware(req) {
  const ipHeader = req.headers.get('x-forwarded-for');
  let ip = req.ip || (ipHeader ? ipHeader.split(',')[0].trim() : 'unknown');
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  console.log('IP détectée:', ip);
  const isAllowed = ALLOWED_NETWORKS.some((regex) => regex.test(ip));
  if (!isAllowed) {
    return new NextResponse('Accès interdit depuis ce réseau', { status: 403 });
  }
  return auth(req);
}

 
export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
  runtime: 'nodejs',
};