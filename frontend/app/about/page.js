import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">关于 GetPass</h1>
          <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed space-y-4">
            <p className="text-lg font-medium text-indigo-900">GetPass 为英美概况 2 打造</p>
            <p><strong>开发者：</strong> Kit Liu（刘思特）</p>
            <p>
              GetPass 是由 Kit 为 2023 级英美概况 2 课程期末复习自主开发的在线学习系统。
              本学期由 <strong>韩松教授</strong> 授课，课程内容广泛，涵盖本学期所学的美国的历史、政治、文化与社会结构等核心知识点。
            </p>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 my-6">
              <h3 className="font-bold text-gray-900 mb-3">本平台支持以下主要功能：</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>选择题、填空题、判断题三类题目专项练习</li>
                <li>实时练习模式与自动化评判系统</li>
                <li>模拟考试（严格按官方卷面比例抽题与计时）</li>
                <li>智能错题本功能，用于查漏补缺</li>
                <li>排行榜与互动反馈机制，激发学习动力</li>
                <li>学习时长与正确率实时追踪</li>
              </ul>
            </div>
            <p>
              GetPass 致力于提供 <strong>简洁、直观、有效</strong> 的备考体验。
              希望它能帮助每一位同学提升学习效率，顺利通过期末考试。
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}