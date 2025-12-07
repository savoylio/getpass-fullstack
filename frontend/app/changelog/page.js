import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Changelog() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">更新日志</h1>
          <p className="text-gray-500 mb-10">持续优化体验</p>
          
          <div className="space-y-10 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            
            {/* v1.1.3 */}
            <div className="relative flex items-start group">
              <div className="absolute left-0 ml-5 -translate-x-1/2 md:mx-auto md:translate-x-0 p-1 bg-white">
                <div className="w-4 h-4 bg-indigo-600 rounded-full shadow-lg ring-4 ring-white"></div>
              </div>
              <div className="pl-12 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-sm">v1.1.3</span>
                    <h3 className="text-lg font-bold text-gray-900">服务体系完善</h3>
                  </div>
                  <span className="text-sm text-gray-400 font-mono mt-1 sm:mt-0">2025-12-05</span>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/60 hover:border-indigo-200 transition-colors">
                  <ul className="space-y-3 text-gray-600 text-sm">
                    <li className="flex gap-2">
                      <span className="shrink-0 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold h-fit mt-0.5">新增</span>
                      <span>上线 <strong>帮助中心 (FAQ)</strong>，支持关键词实时搜索与折叠查看，解决常见疑问。</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold h-fit mt-0.5">优化</span>
                      <span>登录页底部导航修复，现可正常跳转至隐私政策、使用条款及帮助中心。</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold h-fit mt-0.5">优化</span>
                      <span>全站 Footer 结构升级，补充帮助中心入口，统一视觉规范。</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0 bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs font-bold h-fit mt-0.5">内容</span>
                      <span>同步更新了隐私政策与使用条款的具体内容。</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* v1.1.2 */}
            <div className="relative flex items-start group">
              <div className="absolute left-0 ml-5 -translate-x-1/2 md:mx-auto md:translate-x-0 p-1 bg-white">
                <div className="w-3 h-3 bg-gray-300 rounded-full ring-4 ring-white group-hover:bg-indigo-400 transition-colors"></div>
              </div>
              <div className="pl-12 w-full opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-bold">v1.1.2</span>
                    <h3 className="text-base font-bold text-gray-700">交互与修复补丁</h3>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">2025-12-04</span>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                  <ul className="space-y-2 text-gray-500 text-sm list-disc pl-4">
                    <li>修复消息通知角标不实时显示的问题。</li>
                    <li>修复排行榜点赞数据刷新后丢失的问题。</li>
                    <li>优化消息中心逻辑，进入即自动标记已读。</li>
                    <li>考试榜点赞每日 00:00 自动清零，练习榜永久累计。</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* v1.1.0 */}
            <div className="relative flex items-start group">
              <div className="absolute left-0 ml-5 -translate-x-1/2 md:mx-auto md:translate-x-0 p-1 bg-white">
                <div className="w-3 h-3 bg-gray-300 rounded-full ring-4 ring-white group-hover:bg-indigo-400 transition-colors"></div>
              </div>
              <div className="pl-12 w-full opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-bold">v1.1.0</span>
                    <h3 className="text-base font-bold text-gray-700">功能迭代</h3>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">2025-12-01</span>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                  <ul className="space-y-2 text-gray-500 text-sm list-disc pl-4">
                    <li>新增首次登陆项目介绍卡片。</li>
                    <li>新增首页考试倒计时组件。</li>
                    <li>修复错题重练功能。</li>
                    <li>优化排行榜刷新逻辑与界面细节。</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* v1.0.0 */}
            <div className="relative flex items-start group">
              <div className="absolute left-0 ml-5 -translate-x-1/2 md:mx-auto md:translate-x-0 p-1 bg-white">
                <div className="w-3 h-3 bg-gray-200 rounded-full ring-4 ring-white"></div>
              </div>
              <div className="pl-12 w-full opacity-50">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-gray-50 text-gray-400 px-2 py-1 rounded-lg text-xs font-bold">v1.0.0</span>
                  <span className="text-xs text-gray-400 font-mono">2025-11-30</span>
                </div>
                <p className="text-sm text-gray-400">项目初始版本上线，提供基础练习与考试功能。</p>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}