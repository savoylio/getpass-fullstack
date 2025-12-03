'use client';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { User, Lock, Save, Camera } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth(); 
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  // 初始化数据
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setBio(user.stats?.bio || '努力学习，天天向上！');
      setAvatar(user.avatar);
    }
  }, [user]);
  
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('图片太大，请选择小于 2MB 的图片', 'error');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // 强力压缩：宽度限制 150px
        const MAX_WIDTH = 150; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // 质量 0.6
        const base64 = canvas.toDataURL('image/jpeg', 0.6); 
        
        // 即时预览
        setAvatar(base64);
        // 自动保存
        saveAvatar(base64);
      };
    };
  };

  const saveAvatar = async (base64) => {
    setLoading(true);
    try {
      await api.put('/auth/update', { avatarBase64: base64 });
      showToast('头像更新成功', 'success');
    } catch (e) {
      console.error(e);
      showToast('头像上传失败 (可能图片仍过大)', 'error');
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await api.put('/auth/update', { username, bio });
      showToast('资料已更新', 'success');
      setIsEditing(false);
    } catch (e) {
      showToast('保存失败', 'error');
    }
    setLoading(false);
  };

  const handleChangePass = async () => {
    const p = prompt("请输入新密码："); // 这里保留 prompt 因为做 Modal 比较麻烦
    if (p && p.length >= 6) {
      try {
        await api.put('/auth/password', { newPassword: p });
        showToast('密码修改成功', 'success');
      } catch (e) {
        showToast('修改失败', 'error');
      }
    } else if (p) {
        showToast('密码长度需大于6位', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8 text-gray-800">个人中心</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className={`relative inline-block mb-4 group ${isEditing ? 'cursor-pointer' : ''}`} onClick={handleAvatarClick}>
                <img 
                  src={avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-gray-100 object-cover"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
                    <Camera size={24}/>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange}/>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{username}</h2>
              <p className="text-sm text-gray-500 mt-1">加入时间：2025年</p>
              
              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between text-sm">
                 <div className="text-center">
                    <div className="font-bold text-gray-800">{user?.stats?.total_questions || 0}</div>
                    <div className="text-gray-400">刷题</div>
                 </div>
                 <div className="text-center">
                    <div className="font-bold text-gray-800">{(user?.stats?.correct_rate * 100 || 0).toFixed(0)}%</div>
                    <div className="text-gray-400">正确率</div>
                 </div>
                 <div className="text-center">
                    <div className="font-bold text-gray-800">Lv.1</div>
                    <div className="text-gray-400">等级</div>
                 </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-lg flex items-center gap-2"><User size={20}/> 账号信息</h3>
                 <button onClick={() => setIsEditing(!isEditing)} className="text-sm text-indigo-600 font-bold hover:underline">
                   {isEditing ? '取消编辑' : '编辑资料'}
                 </button>
               </div>

               <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                    <input 
                      type="text" 
                      disabled={!isEditing} 
                      value={username} 
                      onChange={e => setUsername(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition disabled:text-gray-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">个性签名</label>
                    <input 
                      type="text" 
                      disabled={!isEditing} 
                      value={bio} 
                      onChange={e => setBio(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition disabled:text-gray-500 disabled:bg-gray-50"
                    />
                  </div>
                  
                  {isEditing && (
                    <button onClick={handleSaveProfile} disabled={loading} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition">
                      <Save size={18}/> {loading ? '保存中...' : '保存修改'}
                    </button>
                  )}
               </div>

               <hr className="my-8 border-gray-100"/>

               <h3 className="font-bold text-lg flex items-center gap-2 mb-6"><Lock size={20}/> 安全设置</h3>
               <button onClick={handleChangePass} className="w-full text-left p-4 border border-gray-200 rounded-xl hover:bg-gray-50 flex justify-between items-center transition group">
                  <span className="text-gray-700 font-medium">修改登录密码</span>
                  <span className="text-gray-400 text-sm group-hover:text-indigo-600">点击修改 &rarr;</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}