import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 font-medium">
            © {new Date().getFullYear()} GetPass Pro 助你轻松过考
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 font-medium">
            <Link href="/about" className="hover:text-indigo-600 transition">项目简介</Link>
            <Link href="/help" className="hover:text-indigo-600 transition">帮助中心</Link>
            <Link href="/changelog" className="hover:text-indigo-600 transition">更新日志</Link>
            <Link href="/feedback" className="hover:text-indigo-600 transition">意见反馈</Link>
            <Link href="/privacy" className="hover:text-indigo-600 transition">隐私政策</Link>
            <Link href="/terms" className="hover:text-indigo-600 transition">使用条款</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}