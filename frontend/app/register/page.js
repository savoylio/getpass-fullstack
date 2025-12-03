'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Eye, EyeOff, Sparkles, UserPlus, Dice5 } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const generateRandom = () => {
    setFormData({ 
      username: 'User_' + Math.floor(1000 + Math.random() * 9000), 
      password: Math.random().toString(36).slice(-8) 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(formData.username, formData.password);
    } catch (err) {
      setError('注册失败，用户名可能已被占用');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 animate-gradient-xy">
      <div className="w-full max-w-md p-8 glass-card rounded-3xl shadow-2xl relative z-10 mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">加入 GetPass</h1>
          <p className="text-gray-500 font-medium">开启你的学霸之旅</p>
        </div>

        {error && (
          <div className="bg-red-50/90 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
            🚫 {error}
          </div>
        )}

        <button 
          type="button" 
          onClick={generateRandom}
          className="w-full mb-6 py-2.5 border border-dashed border-indigo-300 rounded-xl text-sm font-medium text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 transition flex items-center justify-center gap-2"
        >
          <Dice5 size={18}/> 随机生成账号密码
        </button>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 ml-1">用户名</label>
            <input 
              type="text" 
              required
              value={formData.username}
              className="w-full px-5 py-3.5 rounded-xl bg-white/60 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
              placeholder="设置用户名"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
          <div className="space-y-1 relative">
            <label className="text-sm font-bold text-gray-700 ml-1">密码</label>
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"}
                required
                value={formData.password}
                className="w-full px-5 py-3.5 rounded-xl bg-white/60 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
                placeholder="设置密码"
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
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? '注册中...' : <><UserPlus size={20}/> 立即注册</>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            已有账号？ 
            <Link href="/login" className="ml-1 text-indigo-600 font-bold hover:underline">
              直接登录
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