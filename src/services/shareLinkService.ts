import { SupabaseClient } from '@supabase/supabase-js';

export interface ShareLink {
  id: string;
  userId: string;
  username: string;
  resumeId: string;
  isActive: boolean;
  passwordHash?: string;
  viewCount: number;
  lastViewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShareLinkView {
  id: string;
  shareLinkId: string;
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  country?: string;
  city?: string;
  viewedAt: string;
}

export interface ShareLinkStats {
  totalLinks: number;
  activeLinks: number;
  totalViews: number;
  recentViews: number;
}

export interface CreateShareLinkData {
  username: string;
  resumeId: string;
  password?: string;
}

export interface UpdateShareLinkData {
  isActive?: boolean;
  password?: string;
  removePassword?: boolean;
}

class ShareLinkService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * 创建分享链接
   */
  async createShareLink(data: CreateShareLinkData): Promise<ShareLink> {
    try {
      // 首先尝试清理无效的分享链接
      try {
        await this.supabase.rpc('cleanup_invalid_share_links');
      } catch (cleanupError) {
        console.warn('清理无效分享链接失败:', cleanupError);
        // 继续执行，不阻塞主流程
      }

      // 检查用户名是否可用
      const { data: availability, error: checkError } = await this.supabase
        .rpc('check_username_availability', { username_to_check: data.username });

      if (checkError) {
        throw new Error(`检查用户名可用性失败: ${checkError.message}`);
      }

      if (!availability) {
        // 提供更详细的错误信息
        const { data: existingLinks } = await this.supabase
          .from('share_links')
          .select('username, is_active, created_at')
          .eq('username', data.username);
        
        if (existingLinks && existingLinks.length > 0) {
          const link = existingLinks[0];
          throw new Error(`用户名 "${data.username}" 已被使用。该链接创建于 ${new Date(link.created_at).toLocaleString()}，状态：${link.is_active ? '活跃' : '已禁用'}`);
        }
        throw new Error('用户名已被使用，请选择其他用户名');
      }

      // 获取当前用户ID
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('用户未认证');
      }

      // 准备数据
      const shareLinkData: any = {
        user_id: user.id, // 设置用户ID以满足RLS策略
        username: data.username,
        resume_id: data.resumeId,
        is_active: true,
      };

      // 如果有密码，需要哈希处理
      if (data.password) {
        // 这里应该使用安全的密码哈希，暂时使用简单的哈希
        shareLinkData.password_hash = await this.hashPassword(data.password);
      }

      const { data: result, error } = await this.supabase
        .from('share_links')
        .insert(shareLinkData)
        .select()
        .single();

      if (error) {
        throw new Error(`创建分享链接失败: ${error.message}`);
      }

      return this.mapShareLinkFromDB(result);
    } catch (error: any) {
      throw new Error(`创建分享链接失败: ${error.message}`);
    }
  }

  /**
   * 获取用户的分享链接列表
   */
  async getUserShareLinks(userId: string): Promise<ShareLink[]> {
    try {
      const { data, error } = await this.supabase
        .from('share_links')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`获取分享链接失败: ${error.message}`);
      }

      return data.map((link: any) => this.mapShareLinkFromDB(link));
    } catch (error: any) {
      throw new Error(`获取分享链接失败: ${error.message}`);
    }
  }

  /**
   * 通过用户名获取分享链接
   */
  async getShareLinkByUsername(username: string): Promise<ShareLink | null> {
    try {
      const { data, error } = await this.supabase
        .from('share_links')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // 未找到
        }
        throw new Error(`获取分享链接失败: ${error.message}`);
      }

      return this.mapShareLinkFromDB(data);
    } catch (error: any) {
      throw new Error(`获取分享链接失败: ${error.message}`);
    }
  }

  /**
   * 更新分享链接
   */
  async updateShareLink(linkId: string, data: UpdateShareLinkData): Promise<ShareLink> {
    try {
      const updateData: any = {};

      if (data.isActive !== undefined) {
        updateData.is_active = data.isActive;
      }

      if (data.removePassword) {
        updateData.password_hash = null;
      } else if (data.password) {
        updateData.password_hash = await this.hashPassword(data.password);
      }

      updateData.updated_at = new Date().toISOString();

      const { data: result, error } = await this.supabase
        .from('share_links')
        .update(updateData)
        .eq('id', linkId)
        .select()
        .single();

      if (error) {
        throw new Error(`更新分享链接失败: ${error.message}`);
      }

      return this.mapShareLinkFromDB(result);
    } catch (error: any) {
      throw new Error(`更新分享链接失败: ${error.message}`);
    }
  }

  /**
   * 删除分享链接
   */
  async deleteShareLink(linkId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('share_links')
        .delete()
        .eq('id', linkId);

      if (error) {
        throw new Error(`删除分享链接失败: ${error.message}`);
      }
    } catch (error: any) {
      throw new Error(`删除分享链接失败: ${error.message}`);
    }
  }

  /**
   * 记录访问
   */
  async recordView(shareLinkId: string, viewData: {
    ipAddress?: string;
    userAgent?: string;
    referer?: string;
    country?: string;
    city?: string;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('share_link_views')
        .insert({
          share_link_id: shareLinkId,
          ip_address: viewData.ipAddress,
          user_agent: viewData.userAgent,
          referer: viewData.referer,
          country: viewData.country,
          city: viewData.city,
        });

      if (error) {
        throw new Error(`记录访问失败: ${error.message}`);
      }
    } catch (error: any) {
      // 访问记录失败不应该影响主要功能
      console.warn('记录访问失败:', error);
    }
  }

  /**
   * 获取访问记录
   */
  async getViewRecords(shareLinkId: string, limit: number = 50): Promise<ShareLinkView[]> {
    try {
      const { data, error } = await this.supabase
        .from('share_link_views')
        .select('*')
        .eq('share_link_id', shareLinkId)
        .order('viewed_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`获取访问记录失败: ${error.message}`);
      }

      return data.map((view: any) => this.mapShareLinkViewFromDB(view));
    } catch (error: any) {
      throw new Error(`获取访问记录失败: ${error.message}`);
    }
  }

  /**
   * 获取用户分享统计
   */
  async getUserShareStats(userId: string): Promise<ShareLinkStats> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_user_share_stats', { user_uuid: userId });

      if (error) {
        throw new Error(`获取分享统计失败: ${error.message}`);
      }

      return {
        totalLinks: data[0]?.total_links || 0,
        activeLinks: data[0]?.active_links || 0,
        totalViews: data[0]?.total_views || 0,
        recentViews: data[0]?.recent_views || 0,
      };
    } catch (error: any) {
      throw new Error(`获取分享统计失败: ${error.message}`);
    }
  }

  /**
   * 验证密码
   */
  async verifyPassword(shareLinkId: string, password: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('share_links')
        .select('password_hash')
        .eq('id', shareLinkId)
        .single();

      if (error) {
        throw new Error(`验证密码失败: ${error.message}`);
      }

      if (!data.password_hash) {
        return true; // 没有设置密码
      }

      return await this.comparePassword(password, data.password_hash);
    } catch (error: any) {
      throw new Error(`验证密码失败: ${error.message}`);
    }
  }

  /**
   * 检查用户名可用性
   */
  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc('check_username_availability', { username_to_check: username });

      if (error) {
        throw new Error(`检查用户名失败: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      throw new Error(`检查用户名失败: ${error.message}`);
    }
  }

  /**
   * 密码哈希（简单实现，生产环境应使用更安全的方法）
   */
  private async hashPassword(password: string): Promise<string> {
    // 这里应该使用 bcrypt 或其他安全的哈希方法
    // 暂时使用简单的哈希
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 密码比较
   */
  private async comparePassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  /**
   * 映射数据库记录到 ShareLink 对象
   */
  private mapShareLinkFromDB(data: any): ShareLink {
    return {
      id: data.id,
      userId: data.user_id,
      username: data.username,
      resumeId: data.resume_id,
      isActive: data.is_active,
      passwordHash: data.password_hash,
      viewCount: data.view_count,
      lastViewedAt: data.last_viewed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * 映射数据库记录到 ShareLinkView 对象
   */
  private mapShareLinkViewFromDB(data: any): ShareLinkView {
    return {
      id: data.id,
      shareLinkId: data.share_link_id,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      referer: data.referer,
      country: data.country,
      city: data.city,
      viewedAt: data.viewed_at,
    };
  }
}

// 导出服务类，不创建实例
export { ShareLinkService };
