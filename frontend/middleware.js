// frontend/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // 获取当前路径
  const path = request.nextUrl.pathname;

  // 定义受保护的路由 (需要登录才能进)
  const protectedRoutes = ['/home', '/exam', '/exercise', '/wrongbook', '/leaderboard', '/profile', '/message'];

  // 检查是否访问受保护路由
  const isProtected = protectedRoutes.some(route => path.startsWith(route));

  // 获取 Token (这里假设 token 存在 cookie 或 headers，但因为你是 localStorage 方案，
  // Middleware 无法直接读取 localStorage。
  // 所以这里做的是“服务端路由基本保护”，更严格的保护在 Context 的 useEffect 里已经做了)
  
  // 注意：Next.js Middleware 读不到 localStorage。
  // 真正的重定向还是依赖 app/layout.js 或 Context 里的 useEffect。
  // 这个文件主要用于处理未来的 Cookie 鉴权。
  // 现阶段保持为空导出或简单的 pass 即可，主要依赖 AuthContext。
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};