import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { shareLinkService } from '@/services/shareLinkService';

// GET /api/share-links/stats - 获取用户的分享统计
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          },
        },
      }
    );
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const stats = await shareLinkService.getUserShareStats(user.id);
    
    return NextResponse.json({ 
      success: true, 
      data: stats 
    });
  } catch (error: any) {
    console.error('获取分享统计失败:', error);
    return NextResponse.json({ 
      error: error.message || '获取分享统计失败' 
    }, { status: 500 });
  }
}
