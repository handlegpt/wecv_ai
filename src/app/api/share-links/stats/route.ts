import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { shareLinkService } from '@/services/shareLinkService';

// GET /api/share-links/stats - 获取用户的分享统计
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
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
