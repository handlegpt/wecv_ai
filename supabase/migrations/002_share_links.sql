-- 创建分享链接表
CREATE TABLE IF NOT EXISTS share_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  resume_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  password_hash VARCHAR(255), -- 密码保护
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建访问记录表
CREATE TABLE IF NOT EXISTS share_link_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_link_id UUID NOT NULL REFERENCES share_links(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  referer TEXT,
  country VARCHAR(2), -- ISO country code
  city VARCHAR(100),
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_share_links_user_id ON share_links(user_id);
CREATE INDEX IF NOT EXISTS idx_share_links_username ON share_links(username);
CREATE INDEX IF NOT EXISTS idx_share_links_resume_id ON share_links(resume_id);
CREATE INDEX IF NOT EXISTS idx_share_links_active ON share_links(is_active);
CREATE INDEX IF NOT EXISTS idx_share_link_views_link_id ON share_link_views(share_link_id);
CREATE INDEX IF NOT EXISTS idx_share_link_views_viewed_at ON share_link_views(viewed_at);

-- 启用行级安全 (RLS)
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_link_views ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 用户只能访问自己的分享链接
CREATE POLICY "Users can view their own share links" ON share_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own share links" ON share_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own share links" ON share_links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own share links" ON share_links
  FOR DELETE USING (auth.uid() = user_id);

-- 访问记录只能由链接所有者查看
CREATE POLICY "Link owners can view their view records" ON share_link_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM share_links 
      WHERE share_links.id = share_link_views.share_link_id 
      AND share_links.user_id = auth.uid()
    )
  );

-- 任何人都可以插入访问记录（用于统计）
CREATE POLICY "Anyone can insert view records" ON share_link_views
  FOR INSERT WITH CHECK (true);

-- 创建函数：更新分享链接的查看次数
CREATE OR REPLACE FUNCTION update_share_link_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE share_links 
  SET 
    view_count = view_count + 1,
    last_viewed_at = NEW.viewed_at,
    updated_at = NOW()
  WHERE id = NEW.share_link_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器：自动更新查看次数
CREATE TRIGGER trigger_update_share_link_view_count
  AFTER INSERT ON share_link_views
  FOR EACH ROW
  EXECUTE FUNCTION update_share_link_view_count();

-- 创建函数：检查用户名是否可用
CREATE OR REPLACE FUNCTION check_username_availability(username_to_check VARCHAR(50))
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM share_links 
    WHERE username = username_to_check
  );
END;
$$ LANGUAGE plpgsql;

-- 创建函数：清理无效的分享链接
CREATE OR REPLACE FUNCTION cleanup_invalid_share_links()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- 删除没有对应简历的分享链接
  DELETE FROM share_links 
  WHERE resume_id NOT IN (
    SELECT id FROM resumes 
    WHERE id IS NOT NULL
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 创建函数：获取用户的分享链接统计
CREATE OR REPLACE FUNCTION get_user_share_stats(user_uuid UUID)
RETURNS TABLE (
  total_links INTEGER,
  active_links INTEGER,
  total_views BIGINT,
  recent_views BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_links,
    COUNT(*) FILTER (WHERE is_active = true)::INTEGER as active_links,
    COALESCE(SUM(view_count), 0)::BIGINT as total_views,
    COUNT(slv.*) FILTER (WHERE slv.viewed_at > NOW() - INTERVAL '7 days')::BIGINT as recent_views
  FROM share_links sl
  LEFT JOIN share_link_views slv ON sl.id = slv.share_link_id
  WHERE sl.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;
