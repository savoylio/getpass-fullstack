'use client';
import { createContext, useState, useEffect, useContext } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 初始化检查登录状态
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // 登录逻辑 (已更新支持学号+验证码)
  const login = async (account, password, captchaId, captchaAnswer) => {
    const res = await api.post('/auth/login', { 
      account, 
      password, 
      captchaId, 
      captchaAnswer 
    });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    router.push('/home');
  };

  // 注册逻辑 (已废弃，保留空函数防止旧代码报错)
  const register = async () => {
    alert("公开注册已关闭，请使用学号登录。");
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);