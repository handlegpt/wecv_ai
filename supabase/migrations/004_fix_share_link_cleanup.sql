-- 修复分享链接清理逻辑，防止误删有效链接

-- 更新清理函数：只清理超过30天的无效链接
CREATE OR REPLACE FUNCTION cleanup_invalid_share_links()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- 只删除明确无效的分享链接：
  -- 1. 对应的简历确实不存在
  -- 2. 且分享链接创建时间超过30天（给用户足够时间修复）
  DELETE FROM share_links 
  WHERE resume_id NOT IN (
    SELECT id FROM resumes 
    WHERE id IS NOT NULL
  )
  AND created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 更新用户名检查函数：只检查活跃的分享链接
CREATE OR REPLACE FUNCTION check_username_availability(username_to_check VARCHAR(50))
RETURNS BOOLEAN AS $$
BEGIN
  -- 只检查活跃的分享链接，避免已删除链接占用用户名
  RETURN NOT EXISTS (
    SELECT 1 FROM share_links 
    WHERE username = username_to_check 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- 添加注释说明
COMMENT ON FUNCTION cleanup_invalid_share_links() IS '清理无效的分享链接，只删除超过30天的无效链接';
COMMENT ON FUNCTION check_username_availability(VARCHAR) IS '检查用户名是否可用，只检查活跃的分享链接';
