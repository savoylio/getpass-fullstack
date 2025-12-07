'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import AuthLayout from '@/components/AuthLayout';
import { User, Lock, Eye, EyeOff, Loader2, UserPlus, Dice5 } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
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
      // 注册成功逻辑由 Context 处理 (通常也是跳转)
    } catch (err) {
      setError(err.response?.data?.error || '注册失败，用户名可能已存在');
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="创建账号" subtitle="加入大家，开始刷题">
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-enter">
          <div className="text-red-500 mt-0.5">⚠️</div>
          <div className="text-sm text-red-600 font-medium">{error}</div>
        </div>
      )}

      {/* 快捷工具 */}
      <button 
        type="button"
        onClick={generateRandom}
        className="w-full mb-6 py-2 px-4 border border-dashed border-indigo-200 rounded-xl text-xs font-bold text-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 transition flex items-center justify-center gap-2 hover:border-indigo-400"
      >
        <Dice5 size={14}/> 懒得想？随机生成账号密码
      </button>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-gray-700 ml-1" htmlFor="reg-user">
            用户名
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
              <User size={20} />
            </div>
            <input 
              id="reg-user"
              type="text" 
              required
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all input-focus-ring"
              placeholder="设置用户名"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-gray-700 ml-1" htmlFor="reg-pass">
            设置密码
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
              <Lock size={20} />
            </div>
            <input 
              id="reg-pass"
              type={showPass ? "text" : "password"}
              required
              className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all input-focus-ring"
              placeholder="至少 6 位字符"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <button 
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition"
            >
              {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <><Loader2 size={20} className="animate-spin" /> 注册中...</>
          ) : (
            <><UserPlus size={20}/> 立即注册</>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          已有账号？ 
          <Link href="/login" className="ml-1 text-indigo-600 font-bold hover:text-indigo-800 hover:underline transition">
            直接登录
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}