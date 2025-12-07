'use client';
import { Sparkles } from 'lucide-react';
import Link from 'next/link'; // 必须引入 Link

export default function AuthLayout({ children, title, subtitle }) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      
      {/* 动态背景装饰 */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" aria-hidden="true"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" aria-hidden="true"></div>

      {/* 主体内容区 */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 relative z-10">
        
        {/* LOGO / 品牌区 */}
        <div className="mb-8 text-center animate-enter">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-white/50 mb-6">
            <Sparkles size={16} className="text-indigo-600" />
            <span className="text-xs font-bold text-indigo-900 tracking-wide uppercase">2023级英美概况 2</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">GetPass</h1>
          <p className="text-gray-500 font-medium text-lg">{subtitle || '助你轻松过考，稳拿高分'}</p>
        </div>

        {/* 玻璃卡片容器 */}
        <div className="w-full max-w-[440px] glass-panel rounded-3xl p-8 md:p-10 animate-enter" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{title}</h2>
          {children}
        </div>
      </main>

      {/* 底部 Footer (已修复链接) */}
      <footer className="relative z-10 w-full border-t border-gray-200/50 bg-white/30 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-medium">
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-indigo-600 transition cursor-pointer">隐私政策</Link>
            <Link href="/terms" className="hover:text-indigo-600 transition cursor-pointer">使用条款</Link>
            <Link href="/help" className="hover:text-indigo-600 transition cursor-pointer">帮助中心</Link>
          </div>
          <div>
            © {currentYear} GetPass. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}