import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// 创建服务器端 Supabase 客户端
export function createSupabaseServerClient(request: NextRequest) {
  const cookieStore = cookies();
  
  // 从请求头中获取所有cookies
  const requestCookies = request.headers.get('cookie') || '';
  
  // 解析所有cookies
  const parsedCookies = requestCookies.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {} as Record<string, string>);
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // 首先尝试从cookieStore获取
          const cookieValue = cookieStore.get(name)?.value;
          if (cookieValue) return cookieValue;
          
          // 从解析的cookies中获取
          return parsedCookies[name];
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            console.warn('设置cookie失败:', error);
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          } catch (error) {
            console.warn('删除cookie失败:', error);
          }
        },
      },
    }
  );
}

// 验证用户身份并返回调试信息
export async function verifyUser(request: NextRequest) {
  const supabase = createSupabaseServerClient(request);
  
  // 验证用户身份
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  // 调试信息
  const requestCookies = request.headers.get('cookie') || '';
  const parsedCookies = requestCookies.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {} as Record<string, string>);
  
  console.log('API认证调试:', {
    hasUser: !!user,
    userId: user?.id,
    authError: authError?.message,
    cookies: requestCookies,
    supabaseCookies: {
      'sb-access-token': parsedCookies['sb-access-token'] ? '存在' : '缺失',
      'sb-refresh-token': parsedCookies['sb-refresh-token'] ? '存在' : '缺失',
      'supabase-auth-token': parsedCookies['supabase-auth-token'] ? '存在' : '缺失',
    },
    allCookies: Object.keys(parsedCookies),
    allHeaders: Object.fromEntries(request.headers.entries())
  });
  
  return { user, authError, supabase };
}
