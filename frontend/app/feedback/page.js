import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail } from 'lucide-react';

export default function Feedback() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={32}/>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">意见与反馈</h1>
          <p className="text-gray-600 leading-relaxed mb-8 max-w-lg mx-auto">
            如果您在使用过程中遇到问题，或对功能有任何建议，非常欢迎与我联系。<br/>
            GetPass 属于个人独立开发项目，您的每一条意见都非常宝贵，将帮助平台不断完善。
          </p>
          
          <div className="bg-gray-50 p-6 rounded-2xl inline-block text-left border border-gray-200">
            <p className="text-gray-500 text-sm mb-1 uppercase tracking-wide font-bold">联系邮箱 (Email)</p>
            <p className="text-xl font-mono text-gray-800 select-all">kitsandro@outlook.com</p>
            <p className="text-xl font-mono text-gray-800 select-all mt-1">savoylio1733@gmail.com</p>
          </div>
          
          <p className="mt-8 text-indigo-600 font-medium">感谢您的支持与使用！</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}