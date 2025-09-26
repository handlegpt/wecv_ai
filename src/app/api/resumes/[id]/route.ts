import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// GET /api/resumes/[id] - 获取简历数据（公开访问）
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({
        error: '简历ID是必填项'
      }, { status: 400 });
    }

    const supabase = createSupabaseServerClient(request);

    // 添加调试信息
    console.log('尝试获取简历:', { id });

    // 获取简历数据 - 通过分享链接访问的简历不需要公开设置
    const { data: resume, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .single();

    console.log('简历查询结果:', { 
      hasData: !!resume, 
      hasError: !!error, 
      errorMessage: error?.message,
      resumeId: resume?.id,
      resumeTitle: resume?.title
    });

    if (error) {
      console.error('获取简历失败:', error);
      return NextResponse.json({
        error: `简历不存在: ${error.message}`,
        debug: {
          id,
          errorCode: error.code,
          errorMessage: error.message
        }
      }, { status: 404 });
    }

    if (!resume) {
      return NextResponse.json({
        error: '简历不存在'
      }, { status: 404 });
    }

    // 返回简历数据（不包含敏感信息）
    return NextResponse.json({
      success: true,
      data: {
        id: resume.id,
        title: resume.title,
        data: resume.data,
        templateId: resume.template_id,
        createdAt: resume.created_at,
        updatedAt: resume.updated_at,
      }
    });
  } catch (error: any) {
    console.error('获取简历失败:', error);
    return NextResponse.json({
      error: error.message || '获取简历失败'
    }, { status: 500 });
  }
}
