import { NextRequest, NextResponse } from 'next/server';
import { shareLinkService } from '@/services/shareLinkService';

// POST /api/share-links/check-username - 检查用户名可用性
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({ 
        error: '用户名是必填项' 
      }, { status: 400 });
    }

    // 验证用户名格式
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      return NextResponse.json({ 
        error: '用户名只能包含字母、数字、下划线和连字符，长度3-20位',
        available: false 
      }, { status: 400 });
    }

    const isAvailable = await shareLinkService.checkUsernameAvailability(username);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        username,
        available: isAvailable
      }
    });
  } catch (error: any) {
    console.error('检查用户名失败:', error);
    return NextResponse.json({ 
      error: error.message || '检查用户名失败' 
    }, { status: 500 });
  }
}
