"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, Lock, ExternalLink, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { ResumeData } from '@/types/resume';
import { DEFAULT_TEMPLATES } from '@/config';
import templates from '@/components/templates';
import { ResumeTemplate } from '@/types/template';

interface ShareLinkData {
  id: string;
  username: string;
  resumeId: string;
  viewCount: number;
  lastViewedAt?: string;
  createdAt: string;
}

interface ResumeApiData {
  id: string;
  title: string;
  data: ResumeData;
  templateId: string;
  createdAt: string;
  updatedAt: string;
}

export default function PublicSharePage() {
  const params = useParams();
  const username = params.username as string;
  const t = useTranslations('share');
  
  const [shareLink, setShareLink] = useState<ShareLinkData | null>(null);
  const [resumeData, setResumeData] = useState<ResumeApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const loadResumeData = useCallback(async (resumeId: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '获取简历数据失败');
      }
      
      setResumeData(result.data);
    } catch (error: any) {
      console.error('加载简历数据失败:', error);
      setError(error.message);
    }
  }, []);

  const loadShareLink = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = new URL(`/api/share/${username}`, window.location.origin);
      if (password) {
        url.searchParams.set('password', password);
      }
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (!response.ok) {
        if (data.requiresPassword) {
          setRequiresPassword(true);
          return;
        }
        throw new Error(data.error || '获取分享链接失败');
      }
      
      setShareLink(data.data);
      setRequiresPassword(false);
      
      // 加载简历数据
      await loadResumeData(data.data.resumeId);
    } catch (error: any) {
      console.error('加载分享链接失败:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [username, password, loadResumeData]);

  useEffect(() => {
    loadShareLink();
  }, [loadShareLink]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    
    if (!password.trim()) {
      setPasswordError('请输入密码');
      return;
    }
    
    await loadShareLink();
  };

  const copyLink = () => {
    const link = `${window.location.origin}/share/${username}`;
    navigator.clipboard.writeText(link);
    toast.success(t('copySuccess'));
  };

  const handleShare = () => {
    const link = `${window.location.origin}/share/${username}`;
    if (navigator.share) {
      navigator.share({
        title: t('shareTitle'),
        url: link,
      });
    } else {
      copyLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">{t('accessFailed')}</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              {t('retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle>{t('passwordProtection')}</CardTitle>
            <CardDescription>
              {t('passwordRequired')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">{t('passwordProtection')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('enterPassword')}
                  className={passwordError ? 'border-red-500' : ''}
                />
                {passwordError && (
                  <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                {t('accessResume')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!shareLink || !resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>{t('resumeNotFound')}</CardTitle>
            <CardDescription>{t('shareLinkNotFound')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部信息 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {resumeData.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('createdWithWeCV')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {shareLink.viewCount} {t('viewCount')}
              </Badge>
              <Button variant="outline" size="sm" onClick={copyLink}>
                <Copy className="h-4 w-4 mr-1" />
                {t('copyLink')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                {t('share')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 简历内容 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {resumeData ? (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <ResumeRenderer 
              resumeData={resumeData.data} 
              templateId={resumeData.templateId}
            />
          </div>
        ) : (
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p>{t('loadingResume')}</p>
                <p className="text-sm mt-2">
                  {t('resumeId')}: {shareLink.resumeId}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 页脚 */}
      <div className="bg-white dark:bg-gray-800 border-t">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {t('createWeCV')} <a href="/" className="text-blue-600 hover:underline">WeCV AI</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// 简历渲染组件
interface ResumeRendererProps {
  resumeData: ResumeData;
  templateId: string;
}

function ResumeRenderer({ resumeData, templateId }: ResumeRendererProps) {
  const t = useTranslations('share');
  // 获取模板配置
  const template = DEFAULT_TEMPLATES.find((t) => t.id === templateId) || DEFAULT_TEMPLATES[0];
  
  // 获取模板组件
  const TemplateComponent = templates[templateId as keyof typeof templates] || templates["classic"];
  
  if (!TemplateComponent) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>{t('templateError')}</p>
      </div>
    );
  }

  return (
    <div className="resume-container">
      <TemplateComponent 
        data={resumeData} 
        template={template as ResumeTemplate}
      />
    </div>
  );
}
