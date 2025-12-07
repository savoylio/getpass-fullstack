'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Medal, ThumbsUp, Angry, Info } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import clsx from 'clsx';

export default function Leaderboard() {
  const { showToast } = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('exam'); 

  const fetchBoard = (type) => {
    setLoading(true);
    setTab(type);
    api.get(`/leaderboard?type=${type}`).then(res => {
      setList(res.data);
      setLoading(false);
    }).catch(() => {
      showToast('获取榜单失败', 'error');
      setLoading(false);
    });
  };
  
  useEffect(() => {
    fetchBoard('exam');
  }, []);

  const handleInteract = async (toUserId, type, index) => {
    // 乐观更新：先改 UI，再发请求
    const originalList = [...list];
    const newList = [...list];
    
    // UI 立即反馈 (+1)
    if (type === 'like') newList[index].likes++;
    else newList[index].angries++;
    setList(newList);

    try {
      await api.post('/message/send', { toUserId, type, boardType: tab });
      showToast(type === 'like' ? '点赞成功！' : '发送了愤怒表情！', 'success');
    } catch (e) {
      // 失败回滚
      setList(originalList);
      const errMsg = e.response?.data?.error || '操作失败';
      showToast(errMsg, 'error'); // 这里会显示“今天已经互动过了”
    }
  };

  const tabs = [
    { id: 'exam', label: '🏆 考试榜' },
    { id: 'choice', label: '📖 选择题榜' },
    { id: 'blank', label: '✍️ 填空题榜' },
    { id: 'true_false', label: '⚖️ 判断题榜' },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">学霸排行榜</h1>
        
        {/* Tab 切换 */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 custom-scrollbar">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => fetchBoard(t.id)}
              className={clsx(
                "px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition text-sm",
                tab === t.id ? "bg-indigo-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg mb-6 flex items-start gap-2 leading-relaxed">
           <Info size={14} className="mt-0.5 shrink-0"/>
           {tab === 'exam' 
             ? "考试榜：按历史最高分排名。点赞/愤怒每天凌晨清空，可重复互动。" 
             : "刷题榜：按累计刷题轮数排名。点赞/愤怒永久累计，每天限每人一次。"}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500">加载数据中...</div>
          ) : list.length === 0 ? (
            <div className="p-10 text-center text-gray-500">暂无数据，快去挑战吧！</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {list.map((u, i) => (
                <div key={i} className="flex items-center p-5 hover:bg-gray-50 transition group relative">
                   <div className="w-8 text-center font-black text-xl mr-3 italic text-gray-300">
                     {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i+1}
                   </div>
                   
                   <img src={u.avatar} className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 object-cover" />
                   
                   <div className="ml-4 flex-1">
                     <div className="font-bold text-gray-800 text-base">{u.username}</div>
                     <div className="text-xs text-gray-500 font-medium mt-0.5">
                        {tab === 'exam' ? '最高分' : '已刷'} <span className="text-indigo-600 font-bold text-lg">{u.score}</span> {tab === 'exam' ? '分' : '轮'}
                     </div>
                   </div>

                   {/* 交互区 */}
                   <div className="flex gap-3">
                      <button 
                        onClick={() => handleInteract(u.userId, 'like', i)}
                        className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition active:scale-95"
                      >
                        <div className="p-2 bg-gray-50 rounded-full hover:bg-blue-100"><ThumbsUp size={18}/></div>
                        <span className="text-[10px] font-bold">{u.likes}</span>
                      </button>
                      <button 
                        onClick={() => handleInteract(u.userId, 'angry', i)}
                        className="flex flex-col items-center gap-1 text-gray-400 hover:text-red-600 transition active:scale-95"
                      >
                        <div className="p-2 bg-gray-50 rounded-full hover:bg-red-100"><Angry size={18}/></div>
                        <span className="text-[10px] font-bold">{u.angries}</span>
                      </button>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}