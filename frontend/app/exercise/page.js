'use client';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import QuestionCard from '@/components/QuestionCard';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import ConfirmModal from '@/components/ConfirmModal';
import { Loader2, ArrowRight, ArrowLeft, CornerDownLeft, X } from 'lucide-react';

export default function ExercisePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const startTimeRef = useRef(Date.now());

  // 跳转输入框状态
  const [jumpNum, setJumpNum] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  useEffect(() => {
    const type = searchParams.get('type');
    const mode = searchParams.get('mode'); 
    
    if (type || mode === 'wrong') {
      loadQuestions(type, mode);
    } else {
      router.push('/home');
    }
  }, [searchParams, router]);

  const loadQuestions = async (type, mode) => {
    setLoading(true);
    try {
      const url = mode === 'wrong' 
        ? `/questions/exercise?mode=wrong` 
        : `/questions/exercise?type=${type}`;
        
      const res = await api.get(url);
      
      if (res.data.length === 0) {
        showToast(mode === 'wrong' ? '你目前没有错题，太棒了！' : '该类型题库暂时为空', 'success');
        setTimeout(() => router.push('/wrongbook'), 2000); 
        return;
      }
      setQuestions(res.data);
      setIdx(0);
      setAnswer(null);
      setFeedback(null);
      startTimeRef.current = Date.now();
    } catch (e) { 
      console.error(e);
      showToast('加载题目失败', 'error');
    }
    setLoading(false);
  };

  const handleCheck = async () => {
    if(!answer || (Array.isArray(answer) && answer.join('').trim() === '')) {
      showToast("请先填写或选择答案", 'error');
      return;
    }

    const q = questions[idx];
    const durationMs = Date.now() - startTimeRef.current;

    try {
      const res = await api.post('/questions/check', {
        questionId: q.sid,
        userAnswer: answer,
        duration: durationMs
      });
      setFeedback(res.data);
      if(res.data.isCorrect) showToast("回答正确！", 'success');
      else showToast("回答错误", 'error');
    } catch(e) { 
      showToast("提交失败", 'error');
    }
  };

  const nextQ = async () => {
    if (idx < questions.length - 1) {
      setIdx(i => i + 1);
      resetState();
    } else {
      handleFinish();
    }
  };

  const prevQ = () => {
    if (idx > 0) {
      setIdx(i => i - 1);
      resetState();
    }
  };

  const handleJump = () => {
    if (!jumpNum) return;
    const target = parseInt(jumpNum, 10);

    if (isNaN(target)) {
      showToast('请输入有效的数字', 'error');
      return;
    }
    if (target < 1 || target > questions.length) {
      showToast(`题号无效，请输入 1 - ${questions.length} 之间的数字`, 'error');
      return;
    }
    if (target - 1 === idx) return;

    setIdx(target - 1);
    resetState();
    setJumpNum(''); 
  };

  const resetState = () => {
    setAnswer(null);
    setFeedback(null);
    startTimeRef.current = Date.now();
  };

  const handleFinish = () => {
    const mode = searchParams.get('mode');
    if (mode === 'wrong') {
      showToast('错题重练完成！', 'success');
      setTimeout(() => router.push('/wrongbook'), 1000);
    } else {
      setModalConfig({
        title: '🎉 练习结算',
        content: '正在提交你的练习进度...',
        onConfirm: async () => {},
        onCancel: () => {}
      });
      setModalOpen(true);
      submitProgress();
    }
  };

  const submitProgress = async () => {
    try {
       const typeParam = searchParams.get('type');
       const res = await api.post('/questions/finish', { type: typeParam });
       
       setModalConfig(prev => ({
         ...prev,
         content: (
           <div className="text-center">
             <p className="text-lg text-gray-700 mb-2">你已累计完成第 <span className="font-bold text-indigo-600 text-xl">{res.data.rounds}</span> 轮练习</p>
             <p className="text-gray-500 mb-4">当前榜单排名：<span className="font-bold text-orange-500 text-xl">第 {res.data.myRank} 名</span></p>
             <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
               {["太棒了！超越了大部分同学！", "积少成多，量变引起质变！", "保持这个节奏，高分稳了！"][Math.floor(Math.random()*3)]}
             </p>
           </div>
         ),
         onConfirm: () => router.push('/home'),
         onCancel: () => router.push('/home')
       }));
    } catch (e) {
       showToast('保存进度失败', 'error');
       router.push('/home');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-10">
      <Navbar />
      <ConfirmModal 
        isOpen={modalOpen} 
        title={modalConfig.title} 
        content={modalConfig.content}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
      />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-60">
             <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
             <p className="text-gray-500">正在准备试题...</p>
           </div>
        ) : (
          <div>
            {/* === 极简顶部工具栏 (修改处) === */}
            <div className="flex items-center justify-between mb-4 px-1">
               
               {/* 左侧：计数器 */}
               <div className="text-sm font-medium text-gray-500">
                 <span className="text-indigo-600 font-bold text-base mr-0.5">{idx + 1}</span> 
                 <span className="opacity-50">/</span> {questions.length}
               </div>

               {/* 右侧：跳转与退出 */}
               <div className="flex items-center gap-3">
                  
                  {/* 微型跳转框 */}
                  <div className="flex items-center bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <input 
                      type="number" 
                      inputMode="numeric"
                      value={jumpNum}
                      onChange={(e) => setJumpNum(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleJump()}
                      placeholder="#"
                      className="w-8 text-center text-sm font-bold text-gray-700 outline-none bg-transparent placeholder-gray-300"
                    />
                    <button 
                      onClick={handleJump}
                      className="text-gray-300 hover:text-indigo-600 transition pl-1 border-l border-gray-100"
                    >
                      <CornerDownLeft size={14} />
                    </button>
                  </div>

                  {/* 退出按钮 */}
                  <button 
                    onClick={() => router.push(searchParams.get('mode') === 'wrong' ? '/wrongbook' : '/home')} 
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="退出练习"
                  >
                    <X size={18} />
                  </button>
               </div>
            </div>
            
            <QuestionCard 
               data={questions[idx]} 
               userAnswer={answer} 
               onChange={setAnswer} 
               showFeedback={!!feedback}
               feedbackData={feedback}
            />

            <div className="flex justify-between mt-8">
              <button 
                onClick={prevQ} 
                disabled={idx === 0} 
                className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
              >
                <ArrowLeft size={18} /> 上一题
              </button>

              {!feedback ? (
                <button onClick={handleCheck} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5">提交</button>
              ) : (
                <button onClick={nextQ} className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all hover:-translate-y-0.5 shadow-lg shadow-gray-400">
                  {idx === questions.length - 1 ? '完成' : '下一题'} <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}