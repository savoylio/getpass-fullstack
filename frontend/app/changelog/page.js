import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Changelog() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">更新日志</h1>
          <p className="text-gray-500 mb-8">版本：v1.0.0 &nbsp;|&nbsp; 发布日期：2025 年 12 月</p>
          
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-bold text-indigo-600 mb-4 bg-indigo-50 inline-block px-3 py-1 rounded-lg">核心学习模块</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>支持五大题型练习：选择题、填空题、判断题</li>
                <li>实时判题与自动化解析</li>
                <li>题库统一管理与自动抽题</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-indigo-600 mb-4 bg-indigo-50 inline-block px-3 py-1 rounded-lg">模拟考试系统</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>自动抽取试卷（共 100 分）</li>
                <li>在线计时与交卷提醒</li>
                <li>考后成绩卡片与激励动画</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-indigo-600 mb-4 bg-indigo-50 inline-block px-3 py-1 rounded-lg">错题系统</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>自动记录练习与考试错题</li>
                <li>按题型分类筛选查看</li>
              </ul>
            </section>

            <hr className="border-gray-100"/>
            <p className="text-sm text-gray-400 italic">后续版本将持续优化交互动画、排行榜分榜、消息系统等功能。</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}