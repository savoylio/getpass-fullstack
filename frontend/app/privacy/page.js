import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">隐私政策</h1>
          <div className="space-y-6 text-gray-600 leading-relaxed">
            <p>本隐私政策旨在说明 GetPass 如何收集、使用与保护您的个人信息。</p>
            
            <h3 className="text-lg font-bold text-gray-900">1. 信息收集</h3>
            <p>平台在您注册或使用服务时可能会收集：</p>
            <ul className="list-disc pl-5">
              <li>用户名（可修改）</li>
              <li>登录密码（加密存储，不会以明文保存）</li>
              <li>学习记录（做题数量、正确率、用时）</li>
              <li>头像（如您上传，将存储于 LeanCloud 文件系统）</li>
            </ul>
            <p className="text-sm bg-green-50 text-green-700 p-2 rounded">本平台不会收集您的身份证号、手机号、真实姓名等敏感信息。</p>

            <h3 className="text-lg font-bold text-gray-900">2. 信息使用</h3>
            <p>收集的信息仅用于用户登录验证、学习记录统计、排行榜互动及改进产品体验。</p>

            <h3 className="text-lg font-bold text-gray-900">3. 信息储存</h3>
            <p>所有数据存储于 LeanCloud 提供的数据库服务，采用 HTTPS 加密传输。</p>

            <h3 className="text-lg font-bold text-gray-900">4. 信息共享</h3>
            <p>平台不会出售、出租或向任何第三方提供您的个人信息。除非基于法律法规要求或用户本人授权。</p>

            <p className="text-sm text-gray-400 mt-8">使用本平台即表示您同意本政策。</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}