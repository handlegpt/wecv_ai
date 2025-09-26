import { NextRequest, NextResponse } from 'next/server';
import { ShareLinkService } from '@/services/shareLinkService';
import { verifyUser } from '@/lib/supabase-server';

// GET /api/share-links/stats - 获取用户的分享统计
export async function GET(request: NextRequest) {
  try {
    const { user, authError, supabase } = await verifyUser(request);
    
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const shareLinkService = new ShareLinkService(supabase);
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
