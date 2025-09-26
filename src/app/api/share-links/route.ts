import { NextRequest, NextResponse } from 'next/server';
import { shareLinkService } from '@/services/shareLinkService';
import { verifyUser } from '@/lib/supabase-server';

// GET /api/share-links - 获取用户的分享链接列表
export async function GET(request: NextRequest) {
  try {
    const { user, authError, supabase } = await verifyUser(request);
    
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
    const { user, authError, supabase } = await verifyUser(request);
    
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
