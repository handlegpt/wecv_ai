"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { 
  Share2, 
  Lock, 
  Eye, 
  Copy, 
  ExternalLink, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Loader2 
} from 'lucide-react';
import { useShareLinkStore } from '@/store/useShareLinkStore';
import { useResumeStore } from '@/store/useResumeStore';
import { toast } from 'sonner';

interface ShareLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId?: string;
}

export default function ShareLinkDialog({ isOpen, onClose, resumeId }: ShareLinkDialogProps) {
  const { 
    shareLinks, 
    stats, 
    loading, 
    error,
    isCreating,
    isUpdating,
    isDeleting,
    loadShareLinks, 
    loadStats,
    createShareLink,
    updateShareLink,
    deleteShareLink,
    checkUsernameAvailability,
    clearError 
  } = useShareLinkStore();
  
  const { activeResume } = useResumeStore();
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  // 表单状态
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [enablePassword, setEnablePassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const currentResumeId = resumeId || activeResume?.id;
  const currentShareLink = shareLinks.find(link => link.resumeId === currentResumeId);

  useEffect(() => {
    if (isOpen) {
      loadShareLinks();
      loadStats();
      clearError();
    }
  }, [isOpen, loadShareLinks, loadStats, clearError]);

  const handleUsernameChange = async (value: string) => {
    setUsername(value);
    setUsernameError('');
    
    if (value.length >= 3) {
      setCheckingUsername(true);
      try {
        const available = await checkUsernameAvailability(value);
        setUsernameAvailable(available);
        if (!available) {
          setUsernameError('用户名已被使用');
        }
      } catch (error) {
        setUsernameAvailable(false);
        setUsernameError('检查用户名失败');
      } finally {
        setCheckingUsername(false);
      }
    } else {
      setUsernameAvailable(null);
    }
  };

  const validateForm = () => {
    if (!username.trim()) {
      setUsernameError('请输入用户名');
      return false;
    }
    if (username.length < 3) {
      setUsernameError('用户名至少3个字符');
      return false;
    }
    if (username.length > 20) {
      setUsernameError('用户名最多20个字符');
      return false;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setUsernameError('用户名只能包含字母、数字、下划线和连字符');
      return false;
    }
    if (usernameAvailable === false) {
      setUsernameError('用户名已被使用');
      return false;
    }
    if (enablePassword && !password.trim()) {
      toast.error('启用密码保护时请输入密码');
      return false;
    }
    return true;
  };

  const handleCreateShareLink = async () => {
    if (!currentResumeId) {
      toast.error('请先选择一个简历');
      return;
    }

    if (!validateForm()) return;

    try {
      await createShareLink({
        username,
        resumeId: currentResumeId,
        password: enablePassword ? password : undefined,
      });
      
      toast.success('分享链接创建成功！');
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error.message || '创建分享链接失败');
    }
  };

  const handleUpdateShareLink = async () => {
    if (!currentShareLink) return;

    if (!validateForm()) return;

    try {
      await updateShareLink(currentShareLink.id, {
        isActive: true,
        password: enablePassword ? password : undefined,
        removePassword: !enablePassword && !!currentShareLink.passwordHash,
      });
      
      toast.success('分享链接更新成功！');
      onClose();
    } catch (error: any) {
      toast.error(error.message || '更新分享链接失败');
    }
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setEnablePassword(false);
    setUsernameError('');
    setUsernameAvailable(null);
  };

  const handleDeleteShareLink = async () => {
    if (!currentShareLink) return;

    try {
      await deleteShareLink(currentShareLink.id);
      toast.success('分享链接已删除');
      onClose();
    } catch (error: any) {
      toast.error(error.message || '删除分享链接失败');
    }
  };

  const copyShareLink = () => {
    if (currentShareLink) {
      const link = `${window.location.origin}/share/${currentShareLink.username}`;
      navigator.clipboard.writeText(link);
      toast.success('链接已复制到剪贴板');
    }
  };

  const openShareLink = () => {
    if (currentShareLink) {
      const link = `${window.location.origin}/share/${currentShareLink.username}`;
      window.open(link, '_blank');
    }
  };

  const onSubmit = () => {
    if (currentShareLink) {
      handleUpdateShareLink();
    } else {
      handleCreateShareLink();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            管理分享链接
          </DialogTitle>
          <DialogDescription>
            创建和管理您的简历分享链接，让其他人可以查看您的简历
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* 当前分享链接状态 */}
        {currentShareLink && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">当前分享链接</CardTitle>
              <CardDescription>
                链接: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  wecv.com/share/{currentShareLink.username}
                </code>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">查看次数: {currentShareLink.viewCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  {currentShareLink.passwordHash ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      密码保护
                    </Badge>
                  ) : (
                    <Badge variant="outline">公开访问</Badge>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyShareLink}>
                  <Copy className="h-4 w-4 mr-1" />
                  复制链接
                </Button>
                <Button variant="outline" size="sm" onClick={openShareLink}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  预览链接
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDeleteShareLink}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  删除
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* 分享链接表单 */}
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <div className="relative">
              <Input
                id="username"
                placeholder="输入您的用户名"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                disabled={!!currentShareLink}
                className={usernameError ? 'border-red-500' : ''}
              />
              {checkingUsername && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
              {usernameAvailable !== null && !checkingUsername && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameAvailable ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">
              这将创建链接: wecv.com/share/{username || 'username'}
            </p>
            {usernameError && (
              <p className="text-sm text-red-500">{usernameError}</p>
            )}
          </div>

          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">密码保护</Label>
              <p className="text-sm text-gray-500">
                为您的分享链接设置密码，只有知道密码的人才能访问
              </p>
            </div>
            <Switch
              checked={enablePassword}
              onCheckedChange={setEnablePassword}
            />
          </div>

          {enablePassword && (
            <div className="space-y-2">
              <Label htmlFor="password">访问密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="设置访问密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                访问者需要输入此密码才能查看您的简历
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating || isUpdating || usernameAvailable === false}
            >
              {isCreating || isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {currentShareLink ? '更新中...' : '创建中...'}
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  {currentShareLink ? '更新链接' : '创建链接'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>

        {/* 统计信息 */}
        {stats && (
          <>
            <Separator />
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">分享统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">总链接数:</span>
                    <span className="ml-2 font-medium">{stats.totalLinks}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">活跃链接:</span>
                    <span className="ml-2 font-medium">{stats.activeLinks}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">总访问量:</span>
                    <span className="ml-2 font-medium">{stats.totalViews}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">近期访问:</span>
                    <span className="ml-2 font-medium">{stats.recentViews}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
