'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Home, Bell, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // 模拟获取未读消息 (实际应轮询或使用 WebSocket)
  useEffect(() => {
    if (user) {
      api.get('/message/my').then(res => {
        const unread = res.data.filter(m => !m.read).length;
        setUnreadCount(unread);
      }).catch(() => {});
    }
  }, [user]);

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/home" className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
              <Home size={24} /> GetPass
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* 消息通知 */}
            <Link href="/message" className="relative p-2 text-gray-500 hover:text-indigo-600 transition">
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border border-white"></span>
              )}
            </Link>

            {/* 用户头像与下拉 (简化为点击头像去个人中心) */}
            <div className="flex items-center gap-3">
              <Link href="/profile" className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-3 rounded-full transition border border-transparent hover:border-gray-200">
                <img 
                  src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} 
                  alt="Avatar" 
                  className="h-8 w-8 rounded-full border border-gray-200 bg-gray-100"
                />
                <span className="hidden sm:block font-medium text-gray-700 text-sm">{user.username}</span>
              </Link>
              
              <button 
                onClick={logout} 
                className="p-2 text-gray-400 hover:text-red-600 transition"
                title="退出登录"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}