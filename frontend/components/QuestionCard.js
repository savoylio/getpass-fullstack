'use client';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Languages } from 'lucide-react';
import clsx from 'clsx';

export default function QuestionCard({ 
  data, 
  userAnswer, 
  onChange,   
  showFeedback = false, 
  feedbackData = null 
}) {
  const [showZh, setShowZh] = useState(false);

  const isTF = (type) => type === 'truefalse' || type === 'true_false';

  // 填空题自动初始化数组
  useEffect(() => {
    if (data.type === 'blank' && !Array.isArray(userAnswer)) {
      const matches = data.question.match(/_{2,}/g) || [];
      const count = Math.max(matches.length, data.blank_count || 1);
      if (!userAnswer || userAnswer.length !== count) {
        onChange(new Array(count).fill(''));
      }
    }
  }, [data, userAnswer, onChange]);

  const handleBlankChange = (idx, val) => {
    const newArr = [...(userAnswer || [])];
    newArr[idx] = val;
    onChange(newArr);
  };

  const renderBlankText = () => {
    // 如果题目中没有下划线，直接显示输入框
    if (!data.question.includes('____')) {
      return (
        <div className="flex flex-col gap-2">
          <p className="text-lg leading-relaxed">{data.question}</p>
          <input 
            className={clsx(
              "border-b-2 outline-none p-2 w-full max-w-md text-center text-lg bg-gray-50 focus:bg-white transition",
              showFeedback ? "border-gray-300" : "border-indigo-400 focus:border-indigo-600"
            )}
            value={userAnswer?.[0] || ''} 
            onChange={(e) => handleBlankChange(0, e.target.value)} 
            disabled={showFeedback}
            placeholder="在此输入答案..."
          />
        </div>
      );
    }

    // 分割题目渲染输入框
    const parts = data.question.split(/_{2,}/);
    return (
      <div className="leading-loose text-lg">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <input
                type="text"
                disabled={showFeedback}
                value={userAnswer?.[i] || ''}
                onChange={(e) => handleBlankChange(i, e.target.value)}
                className={clsx(
                  "mx-1 px-2 py-1 border-b-2 outline-none w-40 text-center font-medium transition",
                  showFeedback 
                    ? "border-gray-300 text-gray-500 cursor-not-allowed bg-gray-100" 
                    : "border-indigo-400 focus:border-indigo-600 bg-indigo-50/30 focus:bg-white"
                )}
              />
            )}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 transition-all hover:shadow-md">
      {/* 头部：类型标签 + 翻译开关 */}
      <div className="flex justify-between items-center mb-6">
        <span className={clsx(
          "px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wider shadow-sm",
          data.type === 'choice' ? "bg-blue-100 text-blue-700" :
          data.type === 'blank' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
        )}>
          {isTF(data.type) ? '判断题 (True/False)' : data.type === 'choice' ? '选择题 (Choice)' : '填空题 (Fill Blank)'}
        </span>
        
        <button 
          onClick={() => setShowZh(!showZh)} 
          className="flex items-center gap-1 text-gray-400 hover:text-indigo-600 transition text-sm font-medium px-2 py-1 rounded hover:bg-gray-50"
          title="显示中文翻译"
        >
          {showZh ? <EyeOff size={16}/> : <Languages size={16}/>}
          <span>{showZh ? '隐藏翻译' : '中文翻译'}</span>
        </button>
      </div>

      {/* 题干 */}
      <div className="mb-8 font-medium text-gray-800">
        {data.type === 'blank' ? renderBlankText() : <p className="text-xl leading-relaxed">{data.question}</p>}
        
        {/* 翻译区域 */}
        {showZh && (
          <div className="mt-4 p-4 bg-indigo-50/50 rounded-xl text-gray-600 text-base border-l-4 border-indigo-400 animate-in fade-in slide-in-from-top-2 duration-300">
            {data.question_zh}
          </div>
        )}
      </div>

      {/* 选择题选项 */}
      {data.type === 'choice' && (
        <div className="space-y-3">
          {data.options.map((opt, idx) => {
             const isSelected = userAnswer === opt;
             let wrapperClass = "border-2 p-4 rounded-xl cursor-pointer transition flex items-center group relative overflow-hidden";
             
             if (showFeedback) {
               const isCorrect = feedbackData?.correctAnswer === opt || (Array.isArray(feedbackData?.correctAnswer) && feedbackData.correctAnswer.includes(opt));
               if (isCorrect) wrapperClass = "border-green-500 bg-green-50 text-green-800 font-bold";
               else if (isSelected && !isCorrect) wrapperClass = "border-red-500 bg-red-50 text-red-800";
               else wrapperClass = "border-gray-100 opacity-50 bg-gray-50";
             } else {
               if (isSelected) wrapperClass = "border-indigo-600 bg-indigo-50 text-indigo-700 font-medium shadow-sm";
               else wrapperClass = "border-gray-200 hover:border-indigo-300 hover:bg-gray-50";
             }

             return (
               <div key={idx} onClick={() => !showFeedback && onChange(opt)} className={wrapperClass}>
                 <div className={clsx(
                   "w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors z-10",
                   isSelected ? "border-indigo-600" : "border-gray-300 group-hover:border-indigo-400"
                 )}>
                   {isSelected && <div className="w-3 h-3 bg-indigo-600 rounded-full" />}
                 </div>
                 <span className="z-10">{opt}</span>
               </div>
             )
          })}
        </div>
      )}

      {/* 判断题选项 */}
      {isTF(data.type) && (
        <div className="flex gap-6">
          {['True', 'False'].map(val => {
            const isSelected = String(userAnswer).toLowerCase() === val.toLowerCase();
            let btnClass = "flex-1 py-4 border-2 rounded-xl font-bold text-lg transition shadow-sm active:scale-95";
            
            if (showFeedback) {
               const isCorrect = String(feedbackData?.correctAnswer).toLowerCase() === val.toLowerCase();
               if (isCorrect) btnClass += " bg-green-500 text-white border-green-500";
               else if (isSelected) btnClass += " bg-red-500 text-white border-red-500";
               else btnClass += " bg-gray-100 text-gray-300 border-gray-100";
            } else {
               if (isSelected) btnClass += " bg-indigo-600 text-white border-indigo-600 shadow-indigo-200 shadow-md";
               else btnClass += " hover:bg-gray-50 border-gray-200 text-gray-600 hover:border-indigo-300";
            }

            return (
              <button key={val} onClick={() => !showFeedback && onChange(val)} className={btnClass}>
                {val}
              </button>
            )
          })}
        </div>
      )}

      {/* 结果反馈 */}
      {showFeedback && feedbackData && (
        <div className={clsx(
          "mt-8 p-5 rounded-xl border flex flex-col md:flex-row items-start md:items-center gap-4 animate-in zoom-in-95 duration-300",
          feedbackData.isCorrect ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"
        )}>
          <div className={clsx(
            "p-3 rounded-full shrink-0",
            feedbackData.isCorrect ? "bg-green-100" : "bg-red-100"
          )}>
            {feedbackData.isCorrect ? "🎉" : "💔"}
          </div>
          <div>
             <div className="font-bold text-lg">{feedbackData.isCorrect ? "回答正确！" : "回答错误"}</div>
             {!feedbackData.isCorrect && (
                <div className="mt-1">
                  正确答案是: <span className="font-mono font-bold bg-white/50 px-2 py-0.5 rounded border border-black/5 mx-1">{Array.isArray(feedbackData.correctAnswer) ? feedbackData.correctAnswer.join(' 或 ') : String(feedbackData.correctAnswer)}</span>
                </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}