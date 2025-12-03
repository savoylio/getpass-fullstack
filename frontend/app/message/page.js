'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Bell, ThumbsUp, Angry } from 'lucide-react';

export default function MessageCenter() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/message/my').then(res => {
      setMessages(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Bell className="text-indigo-600"/> 消息通知
        </h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">加载中...</div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center">
              <Bell size={40} className="mb-4 text-gray-200"/>
              暂无新消息
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`p-4 border-b last:border-0 flex gap-4 ${msg.read ? 'bg-white' : 'bg-blue-50/50'}`}>
                {/* 图标 */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.type === 'like' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                   {msg.type === 'like' ? <ThumbsUp size={18}/> : <Angry size={18}/>}
                </div>
                
                <div className="flex-1">
                   <p className="text-gray-800 text-sm">
                     <span className="font-bold">{msg.from_user?.username || '有人'}</span> 
                     {msg.type === 'like' ? ' 给你点了个赞！👍' : ' 对你的排名表示愤怒！😡'}
                   </p>
                   <p className="text-xs text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}