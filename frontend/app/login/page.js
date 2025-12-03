'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Eye, EyeOff, Sparkles, LogIn } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData.username, formData.password);
    } catch (err) {
      setError('用户名或密码错误');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 animate-gradient-xy">
      {/* 装饰圆圈 */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md p-8 glass-card rounded-3xl shadow-2xl relative z-10 mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-1.5 rounded-full text-xs font-bold text-indigo-600 shadow-sm mb-4">
            <Sparkles size={14} /> 2023级英美概况 2
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight drop-shadow-sm">GetPass</h1>
          <p className="text-gray-500 font-medium text-lg">助你轻松过考，稳拿高分</p>
        </div>

        {error && (
          <div className="bg-red-50/90 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center shadow-sm">
            <span className="mr-2">🚫</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 ml-1">用户名</label>
            <input 
              type="text" 
              required
              className="w-full px-5 py-3.5 rounded-xl bg-white/60 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition shadow-sm font-medium placeholder-gray-400"
              placeholder="请输入用户名"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
          <div className="space-y-1 relative">
            <label className="text-sm font-bold text-gray-700 ml-1">密码</label>
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"}
                required
                className="w-full px-5 py-3.5 rounded-xl bg-white/60 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition shadow-sm font-medium placeholder-gray-400"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-indigo-600 transition"
              >
                {showPass ? <EyeOff size={20}/> : <Eye size={20}/>}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-70 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-pulse">登录中...</span> : <><LogIn size={20}/> 立即登录</>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            还没有账号？ 
            <Link href="/register" className="ml-1 text-indigo-600 font-bold hover:underline">
              注册新账号
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 text-xs text-gray-500/80 font-medium">
        © {new Date().getFullYear()} GetPass. Designed by Kit.
      </div>
    </div>
  );
}