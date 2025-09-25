import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { shareLinkService } from '@/services/shareLinkService';

// GET /api/share-links/[id] - 获取特定分享链接详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { id } = params;
    
    // 获取分享链接详情（包含访问记录）
    const shareLinks = await shareLinkService.getUserShareLinks(user.id);
    const shareLink = shareLinks.find(link => link.id === id);
    
    if (!shareLink) {
      return NextResponse.json({ error: '分享链接不存在' }, { status: 404 });
    }

    // 获取访问记录
    const viewRecords = await shareLinkService.getViewRecords(id, 100);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...shareLink,
        viewRecords
      }
    });
  } catch (error: any) {
    console.error('获取分享链接详情失败:', error);
    return NextResponse.json({ 
      error: error.message || '获取分享链接详情失败' 
    }, { status: 500 });
  }
}

// PUT /api/share-links/[id] - 更新分享链接
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { isActive, password, removePassword } = body;

    // 验证用户是否拥有这个分享链接
    const userShareLinks = await shareLinkService.getUserShareLinks(user.id);
    const shareLink = userShareLinks.find(link => link.id === id);
    
    if (!shareLink) {
      return NextResponse.json({ error: '分享链接不存在或无权限' }, { status: 404 });
    }

    const updatedShareLink = await shareLinkService.updateShareLink(id, {
      isActive,
      password,
      removePassword,
    });
    
    return NextResponse.json({ 
      success: true, 
      data: updatedShareLink 
    });
  } catch (error: any) {
    console.error('更新分享链接失败:', error);
    return NextResponse.json({ 
      error: error.message || '更新分享链接失败' 
    }, { status: 500 });
  }
}

// DELETE /api/share-links/[id] - 删除分享链接
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { id } = params;

    // 验证用户是否拥有这个分享链接
    const userShareLinks = await shareLinkService.getUserShareLinks(user.id);
    const shareLink = userShareLinks.find(link => link.id === id);
    
    if (!shareLink) {
      return NextResponse.json({ error: '分享链接不存在或无权限' }, { status: 404 });
    }

    await shareLinkService.deleteShareLink(id);
    
    return NextResponse.json({ 
      success: true, 
      message: '分享链接已删除' 
    });
  } catch (error: any) {
    console.error('删除分享链接失败:', error);
    return NextResponse.json({ 
      error: error.message || '删除分享链接失败' 
    }, { status: 500 });
  }
}
