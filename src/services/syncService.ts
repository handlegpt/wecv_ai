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
    console.log("🔍 正在获取云端简历...");
    const { data, error } = await this.supabase
      .from('resumes')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error("❌ 获取云端简历失败:", error);
      throw new Error(`获取云端简历失败: ${error.message}`);
    }

    console.log("📊 云端简历数据:", data);
    return data.map((resume: any) => ({
      id: resume.id,
      title: resume.title,
      data: resume.data,
      templateId: resume.template_id,
      version: resume.version,
      lastModified: resume.updated_at,
    }));
  }

  /**
   * 上传简历到云端
   */
  async uploadResume(resumeData: ResumeSyncData): Promise<void> {
    const { error } = await this.supabase
      .from('resumes')
      .upsert({
        id: resumeData.id,
        title: resumeData.title,
        data: resumeData.data,
        template_id: resumeData.templateId,
        version: resumeData.version,
        updated_at: resumeData.lastModified,
      });

    if (error) {
      throw new Error(`上传简历失败: ${error.message}`);
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
      
      console.log("🔍 检查本地存储键名:", possibleKeys);
      console.log("📦 使用的键名:", usedKey);
      console.log("📊 本地数据:", localData);
      
      if (!localData) {
        console.log("❌ 未找到本地简历数据");
        return [];
      }

      const resumes = JSON.parse(localData);
      console.log("📋 解析后的简历数据:", resumes);
      console.log("📈 简历数量:", Object.keys(resumes).length);
      
      return Object.entries(resumes).map(([id, resume]: [string, any]) => ({
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
      // 使用正确的存储键名
      const storageKey = 'resume-storage';
      const localData = JSON.parse(localStorage.getItem(storageKey) || '{}');
      localData[resumeData.id] = {
        ...resumeData.data,
        title: resumeData.title,
        templateId: resumeData.templateId,
        version: resumeData.version,
        lastModified: resumeData.lastModified,
      };
      localStorage.setItem(storageKey, JSON.stringify(localData));
      console.log("💾 保存简历到本地:", resumeData.title);
    } catch (error) {
      console.error('保存本地简历失败:', error);
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
      console.log("🔄 开始执行同步...");
      
      // 1. 获取本地和云端数据
      const localResumes = this.getLocalResumes();
      console.log("📱 本地简历数量:", localResumes.length, localResumes.map(r => r.title));
      
      const cloudResumes = await this.getCloudResumes();
      console.log("☁️ 云端简历数量:", cloudResumes.length, cloudResumes.map(r => r.title));

      // 2. 检测冲突
      const conflicts = this.detectConflicts(localResumes, cloudResumes);
      result.conflicts = conflicts.length;

      // 3. 处理冲突（默认使用本地版本）
      for (const conflict of conflicts) {
        try {
          await this.uploadResume(conflict.localVersion);
          result.syncedResumes++;
        } catch (error: any) {
          result.errors.push(`处理冲突失败 (${conflict.title}): ${error.message}`);
        }
      }

      // 4. 上传本地新简历到云端
      for (const localResume of localResumes) {
        const existsInCloud = cloudResumes.some(r => r.id === localResume.id);
        if (!existsInCloud) {
          try {
            console.log("⬆️ 上传简历到云端:", localResume.title);
            await this.uploadResume(localResume);
            result.syncedResumes++;
            console.log("✅ 上传成功:", localResume.title);
          } catch (error: any) {
            console.error("❌ 上传失败:", localResume.title, error);
            result.errors.push(`上传简历失败 (${localResume.title}): ${error.message}`);
          }
        } else {
          console.log("⏭️ 简历已存在于云端:", localResume.title);
        }
      }

      // 5. 下载云端新简历到本地
      for (const cloudResume of cloudResumes) {
        const existsLocally = localResumes.some(r => r.id === cloudResume.id);
        if (!existsLocally) {
          try {
            this.saveLocalResume(cloudResume);
            result.syncedResumes++;
          } catch (error: any) {
            result.errors.push(`下载简历失败 (${cloudResume.title}): ${error.message}`);
          }
        }
      }

      // 6. 记录同步日志
      await this.logSync(result);
      
      console.log("🎉 同步完成:", {
        success: result.success,
        syncedResumes: result.syncedResumes,
        conflicts: result.conflicts,
        errors: result.errors.length
      });

    } catch (error: any) {
      console.error("💥 同步失败:", error);
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
        console.log("📝 没有简历数据，跳过日志记录");
        return;
      }
      
      await this.supabase
        .from('sync_logs')
        .insert({
          action: 'sync',
          local_version: 1,
          cloud_version: 1,
          status: result.success ? 'synced' : 'error',
        });
      console.log("📝 同步日志记录成功");
    } catch (error) {
      console.warn("⚠️ 记录同步日志失败（不影响同步功能）:", error);
    }
  }

  /**
   * 检查云端数据（调试用）
   */
  async checkCloudData(): Promise<void> {
    try {
      console.log("🔍 检查云端数据...");
      const { data, error } = await this.supabase
        .from('resumes')
        .select('id, title, created_at, updated_at, version');
      
      if (error) {
        console.error("❌ 检查云端数据失败:", error);
        return;
      }
      
      console.log("📊 云端简历列表:", data);
      console.log("📈 云端简历总数:", data.length);
    } catch (error) {
      console.error("💥 检查云端数据异常:", error);
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
        console.warn("⚠️ 无法获取同步日志（不影响功能）:", syncError);
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
