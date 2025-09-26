import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { shareLinkService } from '@/services/shareLinkService';

// 创建Supabase客户端
function createSupabaseClient(request: NextRequest) {
  const cookieStore = cookies();
  
  // 从请求头中获取所有cookies
  const requestCookies = request.headers.get('cookie') || '';
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // 首先尝试从cookieStore获取
          const cookieValue = cookieStore.get(name)?.value;
          if (cookieValue) return cookieValue;
          
          // 如果cookieStore中没有，从请求头中解析
          const cookies = requestCookies.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            if (key && value) {
              acc[key] = decodeURIComponent(value);
            }
            return acc;
          }, {} as Record<string, string>);
          
          return cookies[name];
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

// GET /api/share-links - 获取用户的分享链接列表
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient(request);
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // 调试信息
    console.log('API认证调试:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message,
      cookies: request.headers.get('cookie'),
      allHeaders: Object.fromEntries(request.headers.entries())
    });
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: '未授权访问',
        debug: {
          authError: authError?.message,
          hasUser: !!user
        }
      }, { status: 401 });
    }

    const shareLinks = await shareLinkService.getUserShareLinks(user.id);
    
    return NextResponse.json({ 
      success: true, 
      data: shareLinks 
    });
  } catch (error: any) {
    console.error('获取分享链接失败:', error);
    return NextResponse.json({ 
      error: error.message || '获取分享链接失败' 
    }, { status: 500 });
  }
}

// POST /api/share-links - 创建新的分享链接
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient(request);
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // 调试信息
    console.log('API认证调试:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message,
      cookies: request.headers.get('cookie'),
      allHeaders: Object.fromEntries(request.headers.entries())
    });
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: '未授权访问',
        debug: {
          authError: authError?.message,
          hasUser: !!user
        }
      }, { status: 401 });
    }

    const body = await request.json();
    const { username, resumeId, password } = body;

    // 验证输入
    if (!username || !resumeId) {
      return NextResponse.json({ 
        error: '用户名和简历ID是必填项' 
      }, { status: 400 });
    }

    // 验证用户名格式
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      return NextResponse.json({ 
        error: '用户名只能包含字母、数字、下划线和连字符，长度3-20位' 
      }, { status: 400 });
    }

    const shareLink = await shareLinkService.createShareLink({
      username,
      resumeId,
      password,
    });
    
    return NextResponse.json({ 
      success: true, 
      data: shareLink 
    });
  } catch (error: any) {
    console.error('创建分享链接失败:', error);
    return NextResponse.json({ 
      error: error.message || '创建分享链接失败' 
    }, { status: 500 });
  }
}
