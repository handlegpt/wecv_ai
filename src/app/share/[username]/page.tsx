"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, Lock, ExternalLink, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareLinkData {
  id: string;
  username: string;
  resumeId: string;
  viewCount: number;
  lastViewedAt?: string;
  createdAt: string;
}

interface ResumeData {
  id: string;
  title: string;
  // 这里应该包含简历的完整数据
  [key: string]: any;
}

export default function PublicSharePage() {
  const params = useParams();
  const username = params.username as string;
  
  const [shareLink, setShareLink] = useState<ShareLinkData | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const loadShareLink = async () => {
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
  };

  useEffect(() => {
    loadShareLink();
  }, [username]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadResumeData = async (resumeId: string) => {
    try {
      // 这里应该从本地存储或API获取简历数据
      // 暂时使用模拟数据
      const mockResumeData = {
        id: resumeId,
        title: '我的简历',
        // 其他简历数据...
      };
      setResumeData(mockResumeData);
    } catch (error) {
      console.error('加载简历数据失败:', error);
    }
  };

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
    toast.success('链接已复制到剪贴板');
  };

  const handleShare = () => {
    const link = `${window.location.origin}/share/${username}`;
    if (navigator.share) {
      navigator.share({
        title: '查看我的简历',
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
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">访问失败</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              重试
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
            <CardTitle>密码保护</CardTitle>
            <CardDescription>
              此分享链接需要密码才能访问
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入访问密码"
                  className={passwordError ? 'border-red-500' : ''}
                />
                {passwordError && (
                  <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                访问简历
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
            <CardTitle>未找到简历</CardTitle>
            <CardDescription>分享链接不存在或已失效</CardDescription>
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
                通过 WeCV AI 创建
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {shareLink.viewCount} 次查看
              </Badge>
              <Button variant="outline" size="sm" onClick={copyLink}>
                <Copy className="h-4 w-4 mr-1" />
                复制链接
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                分享
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 简历内容 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>简历内容将在这里显示</p>
              <p className="text-sm mt-2">
                简历ID: {shareLink.resumeId}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 页脚 */}
      <div className="bg-white dark:bg-gray-800 border-t">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            使用 <a href="/" className="text-blue-600 hover:underline">WeCV AI</a> 创建专业简历
          </p>
        </div>
      </div>
    </div>
  );
}
