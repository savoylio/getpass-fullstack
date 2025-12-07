'use client';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WelcomeModal from '@/components/WelcomeModal';
import Link from 'next/link';
import { BookOpen, PenTool, Trophy, AlertCircle, ArrowRight, Clock, Target, CalendarDays } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('你好');
  const [countdownText, setCountdownText] = useState('计算中...');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 5) setGreeting('夜深了，注意休息！');
    else if (hour < 11) setGreeting('早上好，开始新的一天吧！');
    else if (hour < 13) setGreeting('中午好，吃个午饭放松下？');
    else if (hour < 18) setGreeting('下午好，继续加油！');
    else setGreeting('晚上好，放松一下吧！');

    // 倒计时逻辑 (北京时间 2025-12-18)
    const targetDate = new Date('2025-12-18T00:00:00+08:00');
    const now = new Date();
    const diff = targetDate - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days > 0) setCountdownText(`距离考试还有 ${days} 天`);
    else if (days === 0) setCountdownText('考试就是今天！加油！');
    else setCountdownText('考试已结束，静候佳音');

  }, []);

  const practiceCards = [
    { id: 'choice', title: '选择题专项', total: 87, done: user?.ranking_stats?.choice_rounds || 0, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: <BookOpen/> },
    { id: 'blank', title: '填空题专项', total: 54, done: user?.ranking_stats?.blank_rounds || 0, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', icon: <PenTool/> },
    { id: 'true_false', title: '判断题专项', total: 37, done: user?.ranking_stats?.tf_rounds || 0, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', icon: <Target/> },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <Navbar />
      <WelcomeModal />
      
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        {/* === 头部卡片区 (布局调整) === */}
        <div className="mb-8 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
           <div className="relative z-10 grid md:grid-cols-12 gap-6 md:gap-8">
              
              {/* 左侧：问候语 + 数据统计 (占据 7/12) */}
              <div className="md:col-span-7 flex flex-col justify-between">
                <div className="mb-6">
                   <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{greeting}{user?.username}</h1>
                   <p className="text-gray-500 font-medium">保持专注，你正在一点点超越昨天的自己</p>
                </div>
                
                {/* 数据统计 */}
                <div className="flex gap-6 pt-6 border-t border-gray-100">
                  <div className="flex flex-col">
                     <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">当前正确率</span>
                     <span className="text-2xl font-black text-indigo-600">{(user?.stats?.correct_rate * 100 || 0).toFixed(1)}%</span>
                  </div>
                  <div className="w-px bg-gray-200"></div>
                  <div className="flex flex-col">
                     <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">累计刷题</span>
                     <span className="text-2xl font-black text-gray-800">{user?.stats?.total_questions || 0}</span>
                  </div>
                  <div className="w-px bg-gray-200"></div>
                  <div className="flex flex-col">
                     <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">学习时长</span>
                     <span className="text-2xl font-black text-gray-800">{Math.floor((user?.stats?.total_time || 0) / 60)} <span className="text-sm font-normal text-gray-500">分</span></span>
                  </div>
                </div>
              </div>

              {/* 右侧：倒计时 + 排行榜 (占据 5/12) */}
              <div className="md:col-span-5 flex flex-col gap-3 justify-center">
                {/* 1. 倒计时 */}
                <div className="bg-indigo-600 text-white px-5 py-4 rounded-2xl shadow-lg shadow-indigo-200 flex items-center gap-4 animate-in slide-in-from-right-4 duration-500">
                   <div className="p-2.5 bg-white/20 rounded-xl shrink-0"><CalendarDays size={22}/></div>
                   <div>
                     <div className="text-xs text-indigo-100 opacity-80 mb-0.5">2025 期末考试</div>
                     <div className="font-bold text-lg leading-tight">{countdownText}</div>
                   </div>
                </div>

                {/* 2. 排行榜 (移到这里) */}
                <Link href="/leaderboard" className="flex items-center justify-between bg-yellow-50 p-3 rounded-2xl border border-yellow-100 hover:bg-yellow-100 transition group shadow-sm">
                    <div className="flex items-center gap-3">
                       <div className="p-2.5 bg-yellow-200 text-yellow-700 rounded-xl shrink-0">
                         <Trophy size={20}/>
                       </div>
                       <div>
                         <div className="font-bold text-yellow-900 text-sm">学习排行榜</div>
                         <div className="text-xs text-yellow-700 opacity-80">查看你的排名</div>
                       </div>
                    </div>
                    <div className="bg-white/50 p-1.5 rounded-lg text-yellow-600 group-hover:text-yellow-700 group-hover:bg-white transition">
                      <ArrowRight size={16}/>
                    </div>
                 </Link>
              </div>

           </div>
           {/* 背景装饰 */}
           <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-50/80 to-transparent pointer-events-none"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* 左侧：练习卡片 */}
          <div className="md:col-span-2 space-y-6">
             <div className="flex items-center gap-2 text-gray-800 font-bold text-lg">
                <BookOpen className="text-indigo-500" size={20}/> 专项练习
             </div>
             
             <div className="grid sm:grid-cols-2 gap-4">
               {practiceCards.map(card => (
                 <Link key={card.id} href={`/exercise?type=${card.id}`} className={`p-5 rounded-2xl border ${card.border} bg-white shadow-sm hover:shadow-md transition group relative overflow-hidden`}>
                    <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center mb-3`}>
                      {card.icon}
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">{card.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">已刷 {card.done} 轮</p>
                    
                    <div className="absolute bottom-5 right-5 text-indigo-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                       <ArrowRight size={20}/>
                    </div>
                 </Link>
               ))}
               
               <Link href="/wrongbook" className="p-5 rounded-2xl border border-red-100 bg-white shadow-sm hover:shadow-md transition group">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
                    <AlertCircle/>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">我的错题本</h3>
                  <p className="text-sm text-gray-400 mt-1">消灭盲点，巩固提升</p>
               </Link>
             </div>
          </div>

          {/* 右侧：模拟考试 (排行榜已移走) */}
          <div className="space-y-6">
             <div className="flex items-center gap-2 text-gray-800 font-bold text-lg">
                <Target className="text-indigo-500" size={20}/> 挑战自我
             </div>

             <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden group">
               <div className="relative z-10">
                 <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
                   <Clock/>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900">全真模拟考试</h3>
                 <p className="text-gray-500 text-sm mt-2 mb-6 leading-relaxed">
                   55 道题 • 限时 120 分钟<br/>
                   排行榜每日凌晨重置
                 </p>
                 <Link href="/exam" className="block w-full text-center bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md hover:shadow-lg active:scale-95">
                   立即开始考试
                 </Link>
               </div>
               {/* 装饰圆圈 */}
               <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-50 rounded-full opacity-50 group-hover:scale-125 transition-transform duration-500"></div>
             </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}