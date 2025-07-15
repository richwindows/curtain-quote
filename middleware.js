import { NextResponse } from 'next/server';

export function middleware(request) {
  // 检查是否访问需要认证的页面
  const protectedPaths = ['/', '/quotes', '/config'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
  );

  // 如果不是受保护的路径，直接通过
  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // 检查session token
  const sessionToken = request.cookies.get('session-token');
  
  // 如果没有session token，重定向到登录页
  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url);
    // 添加重定向参数，登录后可以回到原页面
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 有token，允许访问
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了以下开头的：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (登录页面)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
} 