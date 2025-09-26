import { NextRequest, NextResponse } from 'next/server';
import { shareLinkService } from '@/services/shareLinkService';
import { verifyUser } from '@/lib/supabase-server';

// GET /api/share-links/[id] - 获取特定分享链接详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, authError, supabase } = await verifyUser(request);
    
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
    const { user, authError, supabase } = await verifyUser(request);
    
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { password, isActive, removePassword } = body;

    // 检查分享链接是否存在且属于当前用户
    const shareLinks = await shareLinkService.getUserShareLinks(user.id);
    const shareLink = shareLinks.find(link => link.id === id);
    
    if (!shareLink) {
      return NextResponse.json({ error: '分享链接不存在' }, { status: 404 });
    }

    // 更新分享链接
    const updatedShareLink = await shareLinkService.updateShareLink(id, {
      password,
      isActive,
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
    const { user, authError, supabase } = await verifyUser(request);
    
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { id } = params;
    
    // 检查分享链接是否存在且属于当前用户
    const shareLinks = await shareLinkService.getUserShareLinks(user.id);
    const shareLink = shareLinks.find(link => link.id === id);
    
    if (!shareLink) {
      return NextResponse.json({ error: '分享链接不存在' }, { status: 404 });
    }

    // 删除分享链接
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
