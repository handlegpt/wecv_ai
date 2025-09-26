import { NextRequest, NextResponse } from 'next/server';
import { ShareLinkService } from '@/services/shareLinkService';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// GET /api/share/[username] - 通过用户名获取公开的分享链接
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');

    const supabase = createSupabaseServerClient(request);
    const shareLinkService = new ShareLinkService(supabase);
    
    // 获取分享链接
    const shareLink = await shareLinkService.getShareLinkByUsername(username);
    
    if (!shareLink) {
      return NextResponse.json({ 
        error: '分享链接不存在或已禁用' 
      }, { status: 404 });
    }

    // 检查是否需要密码验证
    if (shareLink.passwordHash) {
      if (!password) {
        return NextResponse.json({ 
          error: '此分享链接需要密码访问',
          requiresPassword: true 
        }, { status: 401 });
      }

      const isValidPassword = await shareLinkService.verifyPassword(shareLink.id, password);
      if (!isValidPassword) {
        return NextResponse.json({ 
          error: '密码错误' 
        }, { status: 401 });
      }
    }

    // 记录访问（异步，不阻塞响应）
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';

    // 异步记录访问，不等待结果
    shareLinkService.recordView(shareLink.id, {
      ipAddress: clientIP,
      userAgent,
      referer,
    }).catch(error => {
      console.warn('记录访问失败:', error);
    });

    // 返回分享链接信息（不包含敏感信息）
    return NextResponse.json({ 
      success: true, 
      data: {
        id: shareLink.id,
        username: shareLink.username,
        resumeId: shareLink.resumeId,
        viewCount: shareLink.viewCount,
        lastViewedAt: shareLink.lastViewedAt,
        createdAt: shareLink.createdAt,
      }
    });
  } catch (error: any) {
    console.error('获取分享链接失败:', error);
    return NextResponse.json({ 
      error: error.message || '获取分享链接失败' 
    }, { status: 500 });
  }
}
