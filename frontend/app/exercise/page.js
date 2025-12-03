'use client';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import QuestionCard from '@/components/QuestionCard';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import ConfirmModal from '@/components/ConfirmModal';
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

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

  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam) {
      loadQuestions(typeParam);
    } else {
      router.push('/home');
    }
  }, [searchParams, router]);

  const loadQuestions = async (type) => {
    setLoading(true);
    try {
      const res = await api.get(`/questions/exercise?type=${type}`);
      if (res.data.length === 0) {
        showToast('该类型题库暂时为空', 'error');
        setTimeout(() => router.push('/home'), 2000);
        return;
      }
      setQuestions(res.data);
      setIdx(0);
      setAnswer(null);
      setFeedback(null);
      startTimeRef.current = Date.now();
    } catch (e) { 
      console.error(e);
      showToast('加载题目失败，请检查网络', 'error');
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
      showToast("提交失败，请检查网络", 'error');
    }
  };

  const nextQ = async () => {
    if (idx < questions.length - 1) {
      setIdx(i => i + 1);
      setAnswer(null);
      setFeedback(null);
      startTimeRef.current = Date.now();
    } else {
      setModalConfig({
        title: '恭喜完成！',
        content: '你已刷完本类所有题目。是否提交进度并增加刷题榜轮数？',
        onConfirm: async () => {
           setModalOpen(false);
           try {
             const typeParam = searchParams.get('type');
             await api.post('/questions/finish', { type: typeParam });
             showToast('进度已保存！即将返回首页', 'success');
             setTimeout(() => router.push('/home'), 1500);
           } catch (e) {
             showToast('保存进度失败', 'error');
             router.push('/home');
           }
        }
      });
      setModalOpen(true);
    }
  };

  const handleQuit = () => {
    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-10">
      <Navbar />
      <ConfirmModal 
        isOpen={modalOpen} 
        title={modalConfig.title} 
        content={modalConfig.content}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalOpen(false)}
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-60">
             <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
             <p className="text-gray-500">正在准备试题...</p>
           </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
               <span className="text-gray-500 font-medium bg-white px-3 py-1 rounded-full border shadow-sm text-sm">
                 第 {idx + 1} 题 <span className="text-gray-300">/</span> {questions.length}
               </span>
               <button onClick={handleQuit} className="text-sm font-bold text-red-500 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition">
                 退出练习
               </button>
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
                onClick={() => {
                  if (idx > 0) {
                    setIdx(i => i - 1);
                    setAnswer(null);
                    setFeedback(null);
                    startTimeRef.current = Date.now();
                  }
                }} 
                disabled={idx === 0} 
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ArrowLeft size={18} /> 上一题
              </button>

              {!feedback ? (
                <button onClick={handleCheck} className="bg-indigo-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5">提交答案</button>
              ) : (
                <button onClick={nextQ} className="flex items-center gap-2 bg-gray-900 text-white px-10 py-3 rounded-xl font-bold hover:bg-black transition-all hover:-translate-y-0.5 shadow-lg shadow-gray-400">
                  {idx === questions.length - 1 ? '完成练习' : '下一题'} <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}