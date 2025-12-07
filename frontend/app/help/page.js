'use client';
import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, HelpCircle, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import clsx from 'clsx';

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  // 使用 Set 来管理展开的项目 ID，支持多个同时展开，或者搜索时全部展开
  const [expandedItems, setExpandedItems] = useState(new Set());

  const faqData = [
    {
      category: "账号与登录",
      items: [
        { id: 1, q: "为什么我无法注册？", a: "系统采用学号验证机制，只有在授权名单内的学号才能注册。请确认你的学号已被管理员加入系统。" },
        { id: 2, q: "密码忘记了怎么办？", a: "请使用“重置密码”功能（登录页忘记密码入口）或直接联系管理员处理。" },
        { id: 3, q: "登录提示用户不存在？", a: "请确认你是否使用学号作为账号。用户名可修改，但登录必须使用账号（学号）。" }
      ]
    },
    {
      category: "练习模式",
      items: [
        { id: 4, q: "刷题轮数如何计算？", a: "每完成一组题目（或选择专项并提交）即记一轮。系统会在练习结束页面显示你已完成的轮数及当前排名。" },
        { id: 5, q: "为什么练习榜排名不会每天清零？", a: "刷题榜旨在长期记录你的练习积累与努力，系统设计为累积不清零，刷得越多排名越高。" },
        { id: 6, q: "错题重练打不开？", a: "请确认你使用的是最新版本，且错题本中确实有错题。如果问题仍存在，请尝试刷新页面或联系管理员。" }
      ]
    },
    {
      category: "考试模式",
      items: [
        { id: 7, q: "模拟考试可以重复参加吗？", a: "可以，但每日建议仅进行一次。考试排行榜采用北京时间，会在每日凌晨 00:00 自动清空重置。" },
        { id: 8, q: "考试提交后为什么没有显示排名？", a: "请确认页面已更新至最新版本。正常情况下，提交成功后弹出的成绩卡片会显示“你目前排在第 X 名”。" }
      ]
    },
    {
      category: "排行榜与互动",
      items: [
        { id: 9, q: "为什么我的点赞数一刷新就没了？", a: "刷题榜的点赞会永久保留；考试榜的点赞会在次日随榜单清空。如果你遇到非预期清空，可能是数据同步延迟，请联系管理员。" },
        { id: 10, q: "为什么我收不到消息通知？", a: "可能是消息推送功能未正确触发，或者你已经在消息中心查看过该消息（已读消息不再提示红点）。" }
      ]
    },
    {
      category: "个人资料",
      items: [
        { id: 11, q: "可以修改用户名吗？", a: "可以。学号（Account）是唯一凭证不可修改，但显示的用户名（Username）与头像可在个人中心自由调整。" },
        { id: 12, q: "用户头像无法点击怎么办？", a: "请确认版本是否已更新。正常情况下，导航栏右上角的头像点击后可以跳转至个人资料页。" }
      ]
    },
    {
      category: "系统公告",
      items: [
        { id: 13, q: "首页倒计时是如何计算的？", a: "系统采用北京时间 (UTC+8)，以 2025 年 12 月 18 日为考试日自动计算剩余天数。" }
      ]
    },
    {
      category: "其他",
      items: [
        { id: 14, q: "怎么反馈问题？", a: "可在底部的“意见与反馈”中提交，邮箱：kitsandro@outlook.com 联系管理员。" }
      ]
    }
  ];

  // 搜索过滤逻辑
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return faqData;
    
    const lowerTerm = searchTerm.toLowerCase();
    
    // 过滤分类和条目
    return faqData.map(group => {
      const filteredItems = group.items.filter(item => 
        item.q.toLowerCase().includes(lowerTerm) || 
        item.a.toLowerCase().includes(lowerTerm) ||
        group.category.toLowerCase().includes(lowerTerm)
      );
      
      // 如果该分类下有匹配项，返回该分类及匹配项
      if (filteredItems.length > 0) {
        return { ...group, items: filteredItems };
      }
      return null;
    }).filter(group => group !== null);
  }, [searchTerm]);

  const toggleItem = (id) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedItems(newSet);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        {/* 头部区域 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl mb-6 shadow-sm">
            <HelpCircle size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">帮助中心</h1>
          <p className="text-gray-500">遇到问题？这里有你需要的答案。</p>
        </div>

        {/* 搜索框 */}
        <div className="relative mb-12 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-sm font-medium"
            placeholder="搜索问题关键词，例如：登录、密码、排名..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* FAQ 列表 */}
        <div className="space-y-8">
          {filteredData.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-20"/>
              <p>没有找到相关内容，请尝试更换关键词</p>
            </div>
          ) : (
            filteredData.map((group, groupIdx) => (
              <div key={groupIdx} className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${groupIdx * 100}ms` }}>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">{group.category}</h3>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  {group.items.map((item, itemIdx) => {
                    const isOpen = expandedItems.has(item.id) || searchTerm.length > 0; // 搜索时默认展开
                    return (
                      <div key={item.id} className={clsx("border-b border-gray-100 last:border-0", isOpen ? "bg-indigo-50/30" : "bg-white")}>
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none group"
                        >
                          <span className={clsx("font-bold text-gray-800 group-hover:text-indigo-700 transition", isOpen && "text-indigo-700")}>
                            {item.q}
                          </span>
                          <span className={clsx("ml-4 flex-shrink-0 text-gray-400 transition-transform duration-300", isOpen && "transform rotate-180 text-indigo-500")}>
                            <ChevronDown size={20} />
                          </span>
                        </button>
                        
                        <div 
                          className={clsx(
                            "px-6 text-gray-600 leading-relaxed overflow-hidden transition-all duration-300 ease-in-out",
                            isOpen ? "max-h-96 pb-6 opacity-100" : "max-h-0 opacity-0"
                          )}
                        >
                          {item.a}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 底部联系 */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">
            没找到答案？ 
            <a href="/feedback" className="text-indigo-600 font-bold hover:underline ml-1">联系管理员</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}