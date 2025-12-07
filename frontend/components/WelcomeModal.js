'use client';
import { useState, useEffect } from 'react';
import { X, GraduationCap } from 'lucide-react';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenWelcome_v1');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenWelcome_v1', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 relative">
        {/* 背景装饰 */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="absolute top-4 right-4 text-white/20">
          <GraduationCap size={120} />
        </div>

        <div className="relative pt-12 px-8 pb-8">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-indigo-600 mb-6 mx-auto">
            <GraduationCap size={32} />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-gray-900 mb-2">欢迎来到 GetPass</h2>
            <p className="text-indigo-600 font-bold bg-indigo-50 inline-block px-3 py-1 rounded-full text-xs tracking-wide">英美概况 2 · 期末复习平台</p>
          </div>

          <div className="space-y-4 text-sm text-gray-600 bg-gray-50 p-5 rounded-xl border border-gray-100 mb-6 text-left">
            <p><strong>👨‍💻 创建者：</strong> Kit 刘思特</p>
            <p><strong>🏫 授课教师：</strong> 韩松教授</p>
            <p><strong>✨ 核心功能：</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>专项练习 (选择/填空/判断)</li>
              <li>全真模拟考试 & 实时排行榜</li>
              <li>智能错题本 & 学习统计</li>
            </ul>
            <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200">
              * 注：平台会记录您的练习成绩与排名，仅供学习交流。
            </p>
          </div>

          <button 
            onClick={handleClose}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 active:scale-95"
          >
            开启复习之旅
          </button>
        </div>
      </div>
    </div>
  );
}