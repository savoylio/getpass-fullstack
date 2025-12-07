'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import QuestionCard from '@/components/QuestionCard';
import api from '@/lib/api';
import { BookX, Filter, RotateCcw, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export default function WrongBook() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, choice, blank, true_false

  useEffect(() => {
    api.get('/wrongbook').then(res => {
      setItems(res.data);
      setLoading(false);
    });
  }, []);

  // 筛选逻辑
  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(i => i.question.type === filter);

  // 模拟“重练错题”：其实就是进入一个特殊的练习页，或者在这里直接做
  // 简化起见，这里做一个提示，实际项目可跳转带参数的练习页
// 找到 handleRePractice 函数，替换为：
  const handleRePractice = () => {
    if (items.length === 0) {
      alert("太棒了！你目前没有错题！");
      return;
    }
    // 跳转到带 mode=wrong 的练习页
    window.location.href = '/exercise?mode=wrong'; 
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div className="flex items-center gap-3">
             <div className="p-3 bg-red-100 text-red-600 rounded-xl">
               <BookX size={28} />
             </div>
             <div>
               <h1 className="text-2xl font-bold text-gray-900">我的错题本</h1>
               <p className="text-gray-500 text-sm">共累计 {items.length} 道错题</p>
             </div>
           </div>
           
           <div className="flex gap-3">
             <button onClick={handleRePractice} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition">
                <RotateCcw size={16}/> 错题重练
             </button>
           </div>
        </div>

        {/* 筛选器 Tab */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 custom-scrollbar">
           {[
             {id: 'all', label: '全部'},
             {id: 'choice', label: '选择题'},
             {id: 'blank', label: '填空题'},
             {id: 'true_false', label: '判断题'}
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => setFilter(tab.id)}
               className={clsx(
                 "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition",
                 filter === tab.id 
                   ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                   : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
               )}
             >
               {tab.label}
             </button>
           ))}
        </div>

        {loading ? (
           <div className="text-center py-20 text-gray-400">加载中...</div>
        ) : filteredItems.length === 0 ? (
           <div className="bg-white p-16 rounded-2xl shadow-sm text-center border border-gray-100 flex flex-col items-center">
             <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
               <BookX size={32}/>
             </div>
             <p className="text-xl font-bold text-gray-800">暂无相关错题</p>
             <p className="text-gray-500 mt-2">太棒了！继续保持全对记录。</p>
           </div>
        ) : (
          <div className="space-y-8">
             {filteredItems.map(item => (
               <div key={item.id} className="relative group">
                  <div className="absolute right-0 top-0 bg-red-50 text-red-600 border-l border-b border-red-100 px-3 py-1 text-xs font-bold rounded-bl-xl rounded-tr-xl z-10 flex items-center gap-1">
                     <AlertTriangle size={12}/>
                     上次做错: {new Date(item.lastWrong).toLocaleDateString()}
                  </div>
                  {/* 复用 QuestionCard，直接显示答案 */}
                  <QuestionCard 
                    data={item.question} 
                    userAnswer={item.question.answer} 
                    onChange={()=>{}}
                    showFeedback={true}
                    feedbackData={{ 
                      isCorrect: false, 
                      correctAnswer: item.question.answer 
                    }}
                  />
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}