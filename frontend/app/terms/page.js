import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">使用条款</h1>
          <div className="space-y-6 text-gray-600 leading-relaxed">
            <p>使用本平台即表示您同意以下条款：</p>
            
            <h3 className="text-lg font-bold text-gray-900">1. 使用范围</h3>
            <p>GetPass 仅用于 英美概况 2 学习与复习目的，不得用于任何商业用途。</p>

            <h3 className="text-lg font-bold text-gray-900">2. 用户义务</h3>
            <ul className="list-disc pl-5">
              <li>您需保证注册信息真实无误。</li>
              <li>不得攻击、破解或尝试干扰网站运行。</li>
              <li>不得以任何形式滥用排行榜成绩或违规作弊。</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900">3. 内容版权</h3>
            <p>除题库原始内容外，本系统的设计、界面、功能均由开发者 刘思特 享有权利。</p>

            <h3 className="text-lg font-bold text-gray-900">4. 免责声明</h3>
            <p>尽管我们尽力确保题库准确性，但平台不对题目与答案的绝对正确性承担法律责任。请务必以课堂内容和教师要求为准。</p>

            <p className="text-sm text-gray-400 mt-8">如您继续使用本平台，则视为接受并遵守上述条款。</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}