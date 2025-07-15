'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserNav() {
  const [user, setUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 从cookie读取用户信息
    const userInfoCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user-info='));
    
    if (userInfoCookie) {
      try {
        const userInfo = JSON.parse(decodeURIComponent(userInfoCookie.split('=')[1]));
        setUser(userInfo);
      } catch (error) {
        console.error('解析用户信息失败:', error);
      }
    }
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // 清除本地用户状态
        setUser(null);
        // 重定向到登录页
        router.push('/login');
        router.refresh();
      } else {
        console.error('登出失败');
      }
    } catch (error) {
      console.error('登出请求失败:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return null; // 或者显示加载状态
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-700">
        欢迎，{user.username}
      </span>
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="text-sm text-gray-700 hover:text-red-600 px-3 py-2 rounded-md hover:bg-gray-50 disabled:opacity-50"
      >
        {isLoggingOut ? '登出中...' : '登出'}
      </button>
    </div>
  );
} 