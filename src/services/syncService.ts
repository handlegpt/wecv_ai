import { getSupabaseClient } from '@/lib/supabase';
import { ResumeData } from '@/types/resume';

export interface SyncResult {
  success: boolean;
  syncedResumes: number;
  conflicts: number;
  errors: string[];
}

export interface ResumeSyncData {
  id: string;
  title: string;
  data: ResumeData;
  templateId: string;
  version: number;
  lastModified: string;
}

export interface SyncConflict {
  resumeId: string;
  title: string;
  localVersion: ResumeSyncData;
  cloudVersion: ResumeSyncData;
  resolution: 'local' | 'cloud' | 'merge';
}

class SyncService {
  private supabase = getSupabaseClient();

  /**
   * 获取云端简历列表
   */
  async getCloudResumes(): Promise<ResumeSyncData[]> {
    try {
      // 先测试连接
      const { data: testData, error: testError } = await this.supabase
        .from('resumes')
        .select('count')
        .limit(1);
      
      if (testError) {
        throw new Error(`连接失败: ${testError.message}`);
      }
      
      // 添加超时处理
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('获取云端简历超时')), 15000); // 增加到15秒超时
      });
      
      const queryPromise = this.supabase
        .from('resumes')
        .select('*')
        .order('updated_at', { ascending: false });
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
      
      if (error) {
        throw new Error(`获取云端简历失败: ${error.message}`);
      }
      
      return data.map((resume: any) => ({
        id: resume.id,
        title: resume.title,
        data: resume.data,
        templateId: resume.template_id,
        version: resume.version,
        lastModified: resume.updated_at,
      }));
    } catch (error: any) {
      if (error.message.includes('超时')) {
        throw new Error('网络连接超时，请检查网络连接后重试');
      }
      throw error;
    }
  }

  /**
   * 上传简历到云端
   */
  async uploadResume(resumeData: ResumeSyncData): Promise<void> {
    try {
      console.log(`📤 开始上传简历: ${resumeData.title} (ID: ${resumeData.id})`);
      
      // 获取当前用户ID
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('用户未登录，无法上传简历');
      }
      
      console.log(`👤 用户ID: ${user.id}`);
      
      // 添加上传超时处理
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('上传简历超时')), 10000); // 10秒超时
      });
      
      const uploadPromise = this.supabase
        .from('resumes')
        .upsert({
          id: resumeData.id,
          user_id: user.id, // 添加用户ID以通过RLS检查
          title: resumeData.title,
          data: resumeData.data,
          template_id: resumeData.templateId,
          version: resumeData.version,
          updated_at: resumeData.lastModified,
        });
      
      const { error } = await Promise.race([uploadPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error(`❌ 上传失败: ${error.message}`);
        throw new Error(`上传简历失败: ${error.message}`);
      }
      
      console.log(`✅ 上传成功: ${resumeData.title}`);
    } catch (error: any) {
      if (error.message.includes('超时')) {
        console.error(`⏰ 上传超时: ${resumeData.title}`);
        throw new Error('上传超时，请检查网络连接后重试');
      }
      console.error(`💥 上传异常: ${resumeData.title}`, error.message);
      throw error;
    }
  }

  /**
   * 下载简历从云端
   */
  async downloadResume(resumeId: string): Promise<ResumeSyncData | null> {
    const { data, error } = await this.supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // 简历不存在
      }
      throw new Error(`下载简历失败: ${error.message}`);
    }

    return {
      id: data.id,
      title: data.title,
      data: data.data,
      templateId: data.template_id,
      version: data.version,
      lastModified: data.updated_at,
    };
  }

  /**
   * 删除云端简历
   */
  async deleteCloudResume(resumeId: string): Promise<void> {
    const { error } = await this.supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId);

    if (error) {
      throw new Error(`删除云端简历失败: ${error.message}`);
    }
  }

  /**
   * 获取本地简历数据
   */
  getLocalResumes(): ResumeSyncData[] {
    try {
      // 检查多个可能的存储键名
      const possibleKeys = ['resume-storage', 'resume-data', 'resumes', 'wecv-resumes'];
      let localData = null;
      let usedKey = '';
      
      for (const key of possibleKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          localData = data;
          usedKey = key;
          break;
        }
      }
      
      if (!localData) {
        return [];
      }

      const resumes = JSON.parse(localData);
      
      // 检查数据结构：可能是 {state: {resumes: {...}}} 或直接的 {resumeId: {...}}
      let resumeData = resumes;
      if (resumes.state && resumes.state.resumes) {
        resumeData = resumes.state.resumes;
      }
      
      return Object.entries(resumeData).map(([id, resume]: [string, any]) => ({
        id,
        title: resume.title || '未命名简历',
        data: resume,
        templateId: resume.templateId || 'classic',
        version: resume.version || 1,
        lastModified: resume.lastModified || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('获取本地简历数据失败:', error);
      return [];
    }
  }

  /**
   * 保存简历到本地
   */
  saveLocalResume(resumeData: ResumeSyncData): void {
    try {
      console.log(`💾 保存简历到本地: ${resumeData.title} (ID: ${resumeData.id})`);
      
      // 使用正确的存储键名
      const storageKey = 'resume-storage';
      const localData = JSON.parse(localStorage.getItem(storageKey) || '{}');
      
      // 检查是否是 Zustand 格式
      if (localData.state && localData.state.resumes) {
        console.log(`📦 使用 Zustand 格式保存`);
        // 更新 Zustand 格式的数据
        localData.state.resumes[resumeData.id] = {
          ...resumeData.data,
          title: resumeData.title,
          templateId: resumeData.templateId,
          version: resumeData.version,
          lastModified: resumeData.lastModified,
        };
      } else {
        console.log(`📦 使用直接格式保存`);
        // 直接格式
        localData[resumeData.id] = {
          ...resumeData.data,
          title: resumeData.title,
          templateId: resumeData.templateId,
          version: resumeData.version,
          lastModified: resumeData.lastModified,
        };
      }
      
      localStorage.setItem(storageKey, JSON.stringify(localData));
      console.log(`✅ 本地保存成功: ${resumeData.title}`);
    } catch (error) {
      console.error(`❌ 保存本地简历失败 (${resumeData.title}):`, error);
      throw new Error('保存本地简历失败');
    }
  }

  /**
   * 检测同步冲突
   */
  detectConflicts(localResumes: ResumeSyncData[], cloudResumes: ResumeSyncData[]): SyncConflict[] {
    const conflicts: SyncConflict[] = [];

    for (const localResume of localResumes) {
      const cloudResume = cloudResumes.find(r => r.id === localResume.id);
      
      if (cloudResume) {
        // 检查版本冲突
        if (localResume.version !== cloudResume.version) {
          conflicts.push({
            resumeId: localResume.id,
            title: localResume.title,
            localVersion: localResume,
            cloudVersion: cloudResume,
            resolution: 'local', // 默认使用本地版本
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * 执行完整同步
   */
  async performSync(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      syncedResumes: 0,
      conflicts: 0,
      errors: [],
    };

    try {
      console.log("🔄 开始同步...");
      
      // 1. 获取本地数据
      const localResumes = this.getLocalResumes();
      console.log("📱 本地简历数量:", localResumes.length);
      console.log("📱 本地简历列表:", localResumes.map(r => ({ id: r.id, title: r.title })));
      
      // 2. 尝试获取云端数据（带超时处理）
      let cloudResumes: ResumeSyncData[] = [];
      try {
        cloudResumes = await this.getCloudResumes();
        console.log("☁️ 云端简历数量:", cloudResumes.length);
        console.log("☁️ 云端简历列表:", cloudResumes.map(r => ({ id: r.id, title: r.title })));
      } catch (error: any) {
        console.error("❌ 云端连接失败:", error.message);
        result.errors.push(`云端连接失败: ${error.message}`);
        // 继续执行，只上传本地数据
      }

      // 2. 检测冲突
      const conflicts = this.detectConflicts(localResumes, cloudResumes);
      result.conflicts = conflicts.length;
      console.log("⚠️ 检测到冲突数量:", conflicts.length);
      if (conflicts.length > 0) {
        console.log("⚠️ 冲突详情:", conflicts.map(c => ({ 
          title: c.title, 
          localVersion: c.localVersion.version, 
          cloudVersion: c.cloudVersion.version 
        })));
      }

      // 3. 处理冲突（默认使用本地版本）
      for (const conflict of conflicts) {
        try {
          console.log(`🔄 处理冲突: ${conflict.title}`);
          await this.uploadResume(conflict.localVersion);
          result.syncedResumes++;
          console.log(`✅ 冲突处理成功: ${conflict.title}`);
        } catch (error: any) {
          console.error(`❌ 处理冲突失败 (${conflict.title}):`, error.message);
          result.errors.push(`处理冲突失败 (${conflict.title}): ${error.message}`);
        }
      }

      // 4. 上传本地新简历到云端
      console.log("📤 开始上传本地简历到云端...");
      for (const localResume of localResumes) {
        const existsInCloud = cloudResumes.some(r => r.id === localResume.id);
        if (!existsInCloud) {
          try {
            console.log(`📤 上传简历: ${localResume.title}`);
            await this.uploadResume(localResume);
            result.syncedResumes++;
            console.log(`✅ 上传成功: ${localResume.title}`);
          } catch (error: any) {
            console.error(`❌ 上传失败 (${localResume.title}):`, error.message);
            result.errors.push(`上传简历失败 (${localResume.title}): ${error.message}`);
          }
        } else {
          console.log(`⏭️ 跳过已存在的简历: ${localResume.title}`);
        }
      }

      // 5. 下载云端新简历到本地
      console.log("📥 开始下载云端简历到本地...");
      for (const cloudResume of cloudResumes) {
        const existsLocally = localResumes.some(r => r.id === cloudResume.id);
        if (!existsLocally) {
          try {
            console.log(`📥 下载简历: ${cloudResume.title}`);
            this.saveLocalResume(cloudResume);
            result.syncedResumes++;
            console.log(`✅ 下载成功: ${cloudResume.title}`);
          } catch (error: any) {
            console.error(`❌ 下载失败 (${cloudResume.title}):`, error.message);
            result.errors.push(`下载简历失败 (${cloudResume.title}): ${error.message}`);
          }
        } else {
          console.log(`⏭️ 跳过已存在的简历: ${cloudResume.title}`);
        }
      }

      // 6. 记录同步日志
      await this.logSync(result);

      // 7. 输出同步结果总结
      console.log("🎉 同步完成!");
      console.log("📊 同步结果:", {
        成功: result.success,
        同步简历数: result.syncedResumes,
        冲突数: result.conflicts,
        错误数: result.errors.length
      });
      
      if (result.errors.length > 0) {
        console.error("❌ 同步错误:", result.errors);
      }

    } catch (error: any) {
      console.error("💥 同步失败:", error.message);
      result.success = false;
      result.errors.push(`同步失败: ${error.message}`);
    }

    return result;
  }

  /**
   * 记录同步日志
   */
  private async logSync(result: SyncResult): Promise<void> {
    try {
      // 检查是否有简历数据需要记录
      if (result.syncedResumes === 0) {
        return;
      }
      
      // 获取当前用户ID
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return;
      }
      
      await this.supabase
        .from('sync_logs')
        .insert({
          user_id: user.id, // 添加用户ID以通过RLS检查
          action: 'sync',
          local_version: 1,
          cloud_version: 1,
          status: result.success ? 'synced' : 'error',
        });
    } catch (error) {
      // 静默处理日志记录失败
    }
  }

  /**
   * 检查云端数据（调试用）
   */
  async checkCloudData(): Promise<void> {
    try {
      // 先测试基本连接
      const { data: testData, error: testError } = await this.supabase
        .from('resumes')
        .select('count')
        .limit(1);
      
      if (testError) {
        throw new Error(`连接失败: ${testError.message}`);
      }
      
      // 获取简历数据
      const { data, error } = await this.supabase
        .from('resumes')
        .select('id, title, created_at, updated_at, version');
      
      if (error) {
        throw new Error(`获取简历数据失败: ${error.message}`);
      }
      
      console.log("云端数据检查完成:", {
        count: data.length,
        resumes: data.map((r: any) => ({ id: r.id, title: r.title }))
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取同步状态
   */
  async getSyncStatus(): Promise<{
    lastSync: string | null;
    pendingChanges: number;
    conflicts: number;
  }> {
    try {
      // 获取待同步更改数量
      const localResumes = this.getLocalResumes();
      const cloudResumes = await this.getCloudResumes();
      const conflicts = this.detectConflicts(localResumes, cloudResumes);

      // 尝试获取最后同步时间（如果失败则使用默认值）
      let lastSync = null;
      try {
        const { data: syncData } = await this.supabase
          .from('sync_logs')
          .select('created_at')
          .eq('action', 'sync')
          .eq('status', 'synced')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        lastSync = syncData?.created_at || null;
      } catch (syncError) {
        // 静默处理同步日志获取失败
      }

      return {
        lastSync,
        pendingChanges: localResumes.length + cloudResumes.length,
        conflicts: conflicts.length,
      };
    } catch (error) {
      console.error('获取同步状态失败:', error);
      return {
        lastSync: null,
        pendingChanges: 0,
        conflicts: 0,
      };
    }
  }
}

export const syncService = new SyncService();
