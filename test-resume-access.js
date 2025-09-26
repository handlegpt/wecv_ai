// 测试简历访问的脚本
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('请设置 Supabase 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testResumeAccess() {
  const resumeId = '5c156938-2058-4f9b-b43b-8d54c61410bc';
  
  console.log('测试简历访问...');
  console.log('简历ID:', resumeId);
  
  try {
    // 测试直接查询
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();
    
    console.log('查询结果:');
    console.log('- 有数据:', !!data);
    console.log('- 有错误:', !!error);
    console.log('- 错误信息:', error?.message);
    console.log('- 简历标题:', data?.title);
    console.log('- 简历ID:', data?.id);
    console.log('- 是否公开:', data?.is_public);
    
    if (data) {
      console.log('✅ 简历存在');
    } else {
      console.log('❌ 简历不存在');
    }
    
  } catch (err) {
    console.error('测试失败:', err);
  }
}

testResumeAccess();
