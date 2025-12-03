'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import QuestionCard from '@/components/QuestionCard';
import api from '@/lib/api';
import { Clock, CheckCircle, ArrowLeft, ArrowRight, LayoutGrid } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
// 引入高级组件
import { useToast } from '@/context/ToastContext'; 
import ConfirmModal from '@/components/ConfirmModal'; 

export default function ExamPage() {
  // 这里调用 useToast，如果第二步没做对，这里就会报错导致页面崩溃
  const { showToast } = useToast(); 
  
  const [status, setStatus] = useState('start'); 
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120 * 60);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let t;
    if (status === 'testing' && timeLeft > 0) {
      t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    } else if (timeLeft === 0 && status === 'testing') {
      handleSubmitConfirmed();
    }
    return () => clearInterval(t);
  }, [status, timeLeft]);

  const start = async () => {
    setLoading(true);
    try {
      const res = await api.get('/exam/generate');
      setQuestions(res.data.questions);
      setStatus('testing');
      setTimeLeft(120 * 60);
      showToast('考试开始，加油！', 'success'); // 漂亮的提示
    } catch (e) { 
      console.error(e);
      showToast('无法开始考试，请检查网络', 'error'); 
    }
    setLoading(false);
  };

  const handleSubmitClick = () => {
    if (status !== 'testing') return;
    setModalOpen(true); // 打开漂亮弹窗
  };

  const handleSubmitConfirmed = async () => {
    setModalOpen(false);
    setLoading(true);
    const used = (120 * 60) - timeLeft;
    try {
      const res = await api.post('/exam/submit', { answers, usedTime: used });
      setResult(res.data);
      setStatus('result');
      showToast('交卷成功！', 'success');
    } catch(e) { 
      console.error(e);
      showToast('提交失败，请重试', 'error');
    }
    setLoading(false);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (status === 'start') {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Navbar />
        <div className="max-w-xl mx-auto py-20 px-4 text-center">
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-indigo-50">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-inner">
               <Clock size={40} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">全真模拟考试</h1>
            <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left space-y-2">
              <p className="flex items-center gap-2 text-gray-700"><CheckCircle size={16} className="text-green-500"/> <strong>55 道题目</strong> (涵盖所有题型)</p>
              <p className="flex items-center gap-2 text-gray-700"><CheckCircle size={16} className="text-green-500"/> <strong>120 分钟</strong> 限时作答</p>
              <p className="flex items-center gap-2 text-gray-700"><CheckCircle size={16} className="text-green-500"/> <strong>自动评分</strong> 实时生成分析报告</p>
            </div>
            <button onClick={start} disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-indigo-700 hover:shadow-lg transition transform active:scale-95 disabled:opacity-70">
              {loading ? '试卷生成中...' : '立即开始考试'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'result') {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Navbar />
        <div className="max-w-2xl mx-auto py-12 px-4">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">考试完成！</h2>
            <p className="text-gray-500 mb-8">你的努力正在转化为实力的提升</p>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
               <div className="bg-indigo-50 p-4 rounded-2xl">
                 <div className="text-xs text-indigo-600 font-bold uppercase mb-1">最终得分</div>
                 <div className="text-4xl font-black text-indigo-700">{result.score}</div>
               </div>
               <div className="bg-yellow-50 p-4 rounded-2xl">
                 <div className="text-xs text-yellow-600 font-bold uppercase mb-1">当前排名</div>
                 <div className="text-4xl font-black text-yellow-700">#{result.myRank || '-'}</div>
               </div>
               <div className="bg-red-50 p-4 rounded-2xl">
                 <div className="text-xs text-red-600 font-bold uppercase mb-1">错题数</div>
                 <div className="text-4xl font-black text-red-500">{result.wrongList.length}</div>
               </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-gray-600 text-sm mb-8 font-medium">
               🌟 {result.score > 80 ? "太棒了！你的成绩名列前茅！" : result.score > 60 ? "继续加油，基础很扎实！" : "别灰心，多去错题本复习一下！"}
            </div>

            <div className="flex gap-4">
               <Link href="/home" className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center">返回首页</Link>
               <Link href="/wrongbook" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center">查看错题解析</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <ConfirmModal 
        isOpen={modalOpen}
        title="确认交卷？"
        content="交卷后将无法修改答案，系统将立即为您评分。"
        onConfirm={handleSubmitConfirmed}
        onCancel={() => setModalOpen(false)}
      />

      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30 flex justify-between items-center shadow-sm">
         <div className="flex items-center gap-4">
             <div className="font-bold text-gray-700 text-lg">题号 {idx+1} <span className="text-gray-400 text-sm font-normal">/ {questions.length}</span></div>
             <button onClick={() => setShowPalette(!showPalette)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><LayoutGrid size={20}/></button>
         </div>
         <div className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold transition-colors shadow-inner", timeLeft < 300 ? "bg-red-100 text-red-600 animate-pulse" : "bg-gray-100 text-gray-700")}>
           <Clock size={18}/> {formatTime(timeLeft)}
         </div>
         <button onClick={handleSubmitClick} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition shadow-sm hover:shadow-md flex items-center gap-2">
           <CheckCircle size={16}/> 交卷
         </button>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-3">
            <QuestionCard 
               data={questions[idx]}
               userAnswer={answers[questions[idx].sid]}
               onChange={(val) => setAnswers({...answers, [questions[idx].sid]: val})}
            />
            <div className="flex justify-between mt-8">
              <button disabled={idx===0} onClick={()=>setIdx(i=>i-1)} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-50 transition"><ArrowLeft size={18}/> 上一题</button>
              <button disabled={idx===questions.length-1} onClick={()=>setIdx(i=>i+1)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md disabled:opacity-50 transition">下一题 <ArrowRight size={18}/></button>
            </div>
         </div>
         
         <div className="hidden lg:block">
           <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 sticky top-28">
             <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><LayoutGrid size={18}/> 答题卡</h3>
             <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
               {questions.map((q, i) => (
                 <button key={i} onClick={() => setIdx(i)} className={clsx("h-9 w-9 text-xs rounded-lg font-bold transition-all border", idx === i ? "ring-2 ring-indigo-500 border-transparent z-10 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-500 hover:bg-gray-50", answers[q.sid] && idx !== i ? "bg-indigo-600 text-white border-indigo-600" : "")}>{i+1}</button>
               ))}
             </div>
           </div>
         </div>
      </div>
      
      {showPalette && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden flex items-end" onClick={() => setShowPalette(false)}>
           <div className="bg-white w-full rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-gray-800">题目列表</h3>
                 <button onClick={() => setShowPalette(false)} className="text-gray-500">关闭</button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                 {questions.map((q, i) => (
                   <button key={i} onClick={() => { setIdx(i); setShowPalette(false); }} className={clsx("h-10 w-10 text-sm rounded-lg font-bold transition-all border", idx === i ? "ring-2 ring-indigo-500 border-transparent bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-500", answers[q.sid] && idx !== i ? "bg-indigo-600 text-white border-indigo-600" : "")}>{i+1}</button>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}