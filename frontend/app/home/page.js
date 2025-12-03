'use client';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { BookOpen, PenTool, Trophy, AlertCircle, ArrowRight, Clock, Target } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('你好');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 5) setGreeting('夜深了，注意休息');
    else if (hour < 11) setGreeting('早上好，准备好学习了吗？');
    else if (hour < 13) setGreeting('中午好，吃个午饭放松下？');
    else if (hour < 18) setGreeting('下午好，继续加油！');
    else setGreeting('晚上好，今天过得怎么样？');
  }, []);

  // 模拟的练习进度数据（真实项目可从后端获取做题历史后计算）
  const practiceCards = [
    { id: 'choice', title: '选择题专项', total: 87, done: 0, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: <BookOpen/> },
    { id: 'blank', title: '填空题专项', total: 54, done: 0, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', icon: <PenTool/> },
    { id: 'true_false', title: '判断题专项', total: 37, done: 0, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', icon: <Target/> },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        {/* 动态问候区 */}
        <div className="mb-10 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
           <div className="relative z-10">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{greeting}，{user?.username}</h1>
              <p className="text-gray-500">保持专注，你正在一点点超越昨天的自己。</p>
              
              <div className="flex gap-6 mt-6">
                <div className="flex flex-col">
                   <span className="text-sm text-gray-400">当前正确率</span>
                   <span className="text-2xl font-black text-indigo-600">{(user?.stats?.correct_rate * 100 || 0).toFixed(1)}%</span>
                </div>
                <div className="w-px bg-gray-200"></div>
                <div className="flex flex-col">
                   <span className="text-sm text-gray-400">累计刷题</span>
                   <span className="text-2xl font-black text-gray-800">{user?.stats?.total_questions || 0}</span>
                </div>
                <div className="w-px bg-gray-200"></div>
                <div className="flex flex-col">
                   <span className="text-sm text-gray-400">学习时长</span>
                   <span className="text-2xl font-black text-gray-800">{Math.floor((user?.stats?.total_time || 0) / 60)} <span className="text-sm font-normal text-gray-500">分钟</span></span>
                </div>
              </div>
           </div>
           {/* 装饰背景 */}
           <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-50 to-transparent pointer-events-none"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* 左侧：练习卡片 */}
          <div className="md:col-span-2 space-y-6">
             <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
               <BookOpen className="text-indigo-500"/> 专项练习
             </h2>
             
             <div className="grid sm:grid-cols-2 gap-4">
               {practiceCards.map(card => (
                 <Link key={card.id} href={`/exercise?type=${card.id}`} className={`p-5 rounded-2xl border ${card.border} bg-white shadow-sm hover:shadow-md transition group relative overflow-hidden`}>
                    <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center mb-3`}>
                      {card.icon}
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">{card.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">共 {card.total} 题 • 点击开始</p>
                    
                    <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                       开始练习 <ArrowRight size={16} className="ml-1"/>
                    </div>
                 </Link>
               ))}
               
               {/* 错题本入口 */}
               <Link href="/wrongbook" className="p-5 rounded-2xl border border-red-100 bg-white shadow-sm hover:shadow-md transition group">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
                    <AlertCircle/>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">我的错题本</h3>
                  <p className="text-sm text-gray-400 mt-1">消灭盲点，巩固提升</p>
               </Link>
             </div>
          </div>

          {/* 右侧：模拟考试 & 排行榜入口 */}
          <div className="space-y-6">
             <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
               <Target className="text-indigo-500"/> 挑战自我
             </h2>

             {/* 考试卡片 */}
             <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
               <div className="relative z-10">
                 <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
                   <Clock/>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900">全真模拟考试</h3>
                 <p className="text-gray-500 text-sm mt-2 mb-6">
                   55 道题 • 限时 120 分钟<br/>
                   完全还原真实考试环境
                 </p>
                 <Link href="/exam" className="block w-full text-center bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md hover:shadow-lg">
                   立即开始考试
                 </Link>
               </div>
               <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-50 rounded-full opacity-50"></div>
             </div>

             {/* 排行榜入口 */}
             <Link href="/leaderboard" className="flex items-center justify-between bg-yellow-50 p-5 rounded-2xl border border-yellow-100 hover:bg-yellow-100 transition group">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-yellow-200 text-yellow-700 rounded-lg">
                     <Trophy size={20}/>
                   </div>
                   <div>
                     <div className="font-bold text-yellow-900">学习排行榜</div>
                     <div className="text-xs text-yellow-700">查看你的排名</div>
                   </div>
                </div>
                <ArrowRight size={18} className="text-yellow-600 transform group-hover:translate-x-1 transition"/>
             </Link>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}