'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { Search, Lock, UserCog, CheckCircle, AlertTriangle, KeyRound, Copy } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [searchId, setSearchId] = useState('');
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // 重置相关状态
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // 1. 搜索用户
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    
    setLoading(true);
    setTargetUser(null);
    setNewPassword('');
    
    try {
      const res = await api.post('/admin/user/search', { studentId: searchId });
      setTargetUser(res.data);
    } catch (err) {
      showToast(err.response?.data?.error || '查询失败', 'error');
    }
    setLoading(false);
  };

  // 2. 生成随机密码
  const generatePassword = () => {
    const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  // 3. 执行重置
  const handleReset = async () => {
    if (!newPassword) {
      showToast('请输入或生成新密码', 'error');
      return;
    }
    
    if (!confirm(`⚠️ 警告：确定要重置学号 [${targetUser.account}] 的密码吗？此操作不可撤销。`)) {
      return;
    }

    setIsResetting(true);
    try {
      await api.post('/auth/reset-password', {
        studentId: targetUser.account,
        newPassword: newPassword
      });
      showToast('✅ 密码重置成功！', 'success');
      // 清理状态，防止误操作
      setNewPassword(''); 
    } catch (err) {
      showToast(err.response?.data?.error || '重置失败', 'error');
    }
    setIsResetting(false);
  };

  // 权限拦截视图
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center">
        <Navbar />
        <div className="text-center p-10">
          <Lock size={48} className="mx-auto text-gray-300 mb-4"/>
          <h2 className="text-xl font-bold text-gray-700">访问受限</h2>
          <p className="text-gray-500 mt-2">只有管理员可以访问此页面。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <UserCog size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">用户管理控制台</h1>
            <p className="text-gray-500 text-sm">查询学号并安全重置密码</p>
          </div>
        </div>

        {/* 搜索卡片 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="请输入学号 (Account)..." 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
              />
              <Search className="absolute left-3.5 top-3.5 text-gray-400" size={20}/>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-70"
            >
              {loading ? '查询中...' : '查找用户'}
            </button>
          </form>
        </div>

        {/* 用户信息与操作区 */}
        {targetUser && (
          <div className="bg-white rounded-2xl shadow-lg border border-indigo-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            {/* 用户概览 */}
            <div className="p-6 border-b border-gray-100 bg-indigo-50/30">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{targetUser.username}</h2>
                  <p className="text-indigo-600 font-mono font-medium flex items-center gap-2">
                    <span className="bg-indigo-100 px-2 py-0.5 rounded text-xs">学号</span>
                    {targetUser.account}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${targetUser.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {targetUser.isActive ? '状态正常' : '已禁用'}
                </div>
              </div>
              <div className="mt-4 flex gap-6 text-sm text-gray-500">
                <p>注册时间: {new Date(targetUser.createdAt).toLocaleDateString()}</p>
                <p>上次登录: {targetUser.lastLoginAt ? new Date(targetUser.lastLoginAt).toLocaleString() : '从未登录'}</p>
              </div>
            </div>

            {/* 重置密码操作区 */}
            <div className="p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <KeyRound size={18} className="text-orange-500"/> 重置密码
              </h3>
              
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18}/>
                  <div className="text-sm text-orange-800">
                    <p className="font-bold mb-1">无损重置模式</p>
                    <p>重置操作<strong>仅修改密码</strong>。用户的刷题记录、错题本、排行榜数据均会<strong>完整保留</strong>，不会丢失。</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="输入新密码或点击生成" 
                    className="w-full pl-4 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none font-mono text-lg text-center tracking-wider text-gray-800"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
                <button 
                  onClick={generatePassword}
                  className="px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition whitespace-nowrap"
                >
                  随机生成
                </button>
              </div>

              {newPassword && (
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={handleReset}
                    disabled={isResetting}
                    className="w-full sm:w-auto px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition flex items-center justify-center gap-2"
                  >
                    {isResetting ? '处理中...' : '确认重置密码'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}