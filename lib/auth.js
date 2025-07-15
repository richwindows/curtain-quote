import { cookies } from 'next/headers';

export function checkAuth() {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session-token');
    const userInfo = cookieStore.get('user-info');

    if (!sessionToken || !userInfo) {
      return { isAuthenticated: false, user: null };
    }

    // 解析用户信息
    const user = JSON.parse(userInfo.value);

    return {
      isAuthenticated: true,
      user: user,
      sessionToken: sessionToken.value
    };
  } catch (error) {
    console.error('认证检查错误:', error);
    return { isAuthenticated: false, user: null };
  }
}

export function requireAuth(redirectTo = '/login') {
  const auth = checkAuth();
  
  if (!auth.isAuthenticated) {
    throw new Error('REDIRECT_TO_LOGIN');
  }
  
  return auth;
} 