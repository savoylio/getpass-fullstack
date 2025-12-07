'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import AuthLayout from '@/components/AuthLayout';
import api from '@/lib/api'; // 引入 API 用于获取验证码
import { User, Lock, Eye, EyeOff, Loader2, ArrowRight, Calculator, RefreshCcw } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  // 增加 captchaAnswer 字段
  const [formData, setFormData] = useState({ account: '', password: '', captchaAnswer: '' }); 
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 新增：验证码状态
  const [captcha, setCaptcha] = useState({ id: '', question: '...' });

  // 初始化加载验证码
  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const res = await api.get('/captcha/new');
      setCaptcha({ id: res.data.captchaId, question: res.data.question });
      // 清空之前的输入
      setFormData(prev => ({ ...prev, captchaAnswer: '' }));
    } catch (e) {
      console.error("Captcha load failed", e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // 模拟网络延迟感，优化体验
    const minTime = new Promise(resolve => setTimeout(resolve, 600));
    
    try {
      // 关键：将 account, password, captchaId, captchaAnswer 全部传给 AuthContext
      const loginReq = login(formData.account, formData.password, captcha.id, formData.captchaAnswer);
      await Promise.all([loginReq, minTime]);
    } catch (err) {
      const msg = err.response?.data?.error || '登录失败，请重试';
      setError(msg);
      setLoading(false);
      fetchCaptcha(); // 失败后刷新验证码
    }
  };

  return (
    <AuthLayout title="欢迎回来" subtitle="高效复习，从现在开始">
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-enter">
          <div className="text-red-500 mt-0.5">⚠️</div>
          <div className="text-sm text-red-600 font-medium">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 学号输入 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-gray-700 ml-1" htmlFor="account">
            学号
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
              <User size={20} />
            </div>
            <input 
              id="account"
              type="text" 
              required
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all input-focus-ring"
              placeholder="请输入学号"
              value={formData.account}
              onChange={(e) => setFormData({...formData, account: e.target.value})}
            />
          </div>
        </div>

        {/* 密码输入 */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center ml-1">
            <label className="block text-sm font-bold text-gray-700" htmlFor="password">
              密码
            </label>
            <button type="button" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline" onClick={() => alert("请联系管理员或课代表重置密码")}>
              忘记密码?
            </button>
          </div>
          <div className="relative group">
            <div className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
              <Lock size={20} />
            </div>
            <input 
              id="password"
              type={showPass ? "text" : "password"}
              required
              className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all input-focus-ring"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <button 
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition p-0.5 rounded-md hover:bg-gray-100"
            >
              {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
        </div>

        {/* 验证码输入 (新增) */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-gray-700 ml-1">
            人机验证
          </label>
          <div className="flex gap-3">
            {/* 题目显示区 */}
            <div className="relative group w-32 shrink-0">
               <div className="w-full h-[52px] bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-center font-mono font-bold text-lg text-indigo-700 select-none">
                 {captcha.question}
               </div>
               {/* 刷新按钮 */}
               <button 
                 type="button" 
                 onClick={fetchCaptcha}
                 className="absolute -right-2 -top-2 bg-white text-gray-400 hover:text-indigo-600 p-1 rounded-full shadow-sm border border-gray-200 transition"
                 title="刷新验证码"
               >
                 <RefreshCcw size={14}/>
               </button>
            </div>

            {/* 答案输入区 */}
            <div className="relative flex-1 group">
              <div className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                <Calculator size={20} />
              </div>
              <input 
                type="text" // 保持 text 防止移动端键盘布局问题
                inputMode="numeric"
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all input-focus-ring"
                placeholder="计算结果"
                value={formData.captchaAnswer}
                onChange={(e) => setFormData({...formData, captchaAnswer: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center ml-1">
          <input 
            id="remember-me" 
            type="checkbox" 
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-500 cursor-pointer select-none">
            7 天内自动登录
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
        >
          {loading ? (
            <><Loader2 size={20} className="animate-spin" /> 验证中...</>
          ) : (
            <>立即登录 <ArrowRight size={20} className="opacity-60 group-hover:translate-x-1 transition-transform"/></>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          还没有账号？ 
          <Link href="/register" className="ml-1 text-indigo-600 font-bold hover:text-indigo-800 hover:underline transition">
            注册新账号
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}