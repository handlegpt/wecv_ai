-- 修复简历访问权限，允许通过分享链接公开访问简历

-- 删除现有的公开访问策略（如果存在）
DROP POLICY IF EXISTS "Public can view resumes via share links" ON public.resumes;

-- 创建新的公开访问策略
CREATE POLICY "Public can view resumes via share links" ON public.resumes
    FOR SELECT USING (true);
