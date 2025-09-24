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
    const { data, error } = await this.supabase
      .from('resumes')
      .select('*')
      .order('updated_at', { ascending: false });

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
      const localData = localStorage.getItem('resume-data');
      if (!localData) return [];

      const resumes = JSON.parse(localData);
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
      const localData = JSON.parse(localStorage.getItem('resume-data') || '{}');
      localData[resumeData.id] = {
        ...resumeData.data,
        title: resumeData.title,
        templateId: resumeData.templateId,
        version: resumeData.version,
        lastModified: resumeData.lastModified,
      };
      localStorage.setItem('resume-data', JSON.stringify(localData));
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
      // 1. 获取本地和云端数据
      const localResumes = this.getLocalResumes();
      const cloudResumes = await this.getCloudResumes();

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
            await this.uploadResume(localResume);
            result.syncedResumes++;
          } catch (error: any) {
            result.errors.push(`上传简历失败 (${localResume.title}): ${error.message}`);
          }
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

    } catch (error: any) {
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
      await this.supabase
        .from('sync_logs')
        .insert({
          action: 'sync',
          local_version: 1,
          cloud_version: 1,
          status: result.success ? 'synced' : 'error',
        });
    } catch (error) {
      console.error('记录同步日志失败:', error);
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
      // 获取最后同步时间
      const { data: lastSync } = await this.supabase
        .from('sync_logs')
        .select('created_at')
        .eq('action', 'sync')
        .eq('status', 'synced')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // 获取待同步更改数量
      const localResumes = this.getLocalResumes();
      const cloudResumes = await this.getCloudResumes();
      const conflicts = this.detectConflicts(localResumes, cloudResumes);

      return {
        lastSync: lastSync?.created_at || null,
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
