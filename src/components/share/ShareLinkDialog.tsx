"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('share');
  
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
          setUsernameError(t('usernameTaken'));
        }
      } catch (error) {
        setUsernameAvailable(false);
        setUsernameError(t('checkUsernameFailed'));
      } finally {
        setCheckingUsername(false);
      }
    } else {
      setUsernameAvailable(null);
    }
  };

  const validateForm = () => {
    if (!username.trim()) {
      setUsernameError(t('usernameRequired'));
      return false;
    }
    if (username.length < 3) {
      setUsernameError(t('usernameMinLength'));
      return false;
    }
    if (username.length > 20) {
      setUsernameError(t('usernameMaxLength'));
      return false;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setUsernameError(t('usernameInvalidChars'));
      return false;
    }
    if (usernameAvailable === false) {
      setUsernameError(t('usernameTaken'));
      return false;
    }
    if (enablePassword && !password.trim()) {
      toast.error(t('passwordRequiredWhenEnabled'));
      return false;
    }
    return true;
  };

  const handleCreateShareLink = async () => {
    if (!currentResumeId) {
      toast.error(t('selectResumeFirst'));
      return;
    }

    if (!validateForm()) return;

    try {
      await createShareLink({
        username,
        resumeId: currentResumeId,
        password: enablePassword ? password : undefined,
      });
      
      toast.success(t('shareLinkCreated'));
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error.message || t('createShareLinkFailed'));
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
      
      toast.success(t('shareLinkUpdated'));
      onClose();
    } catch (error: any) {
      toast.error(error.message || t('updateShareLinkFailed'));
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
            {t('manageShareLinksTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('manageShareLinksDescription')}
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
              <CardTitle className="text-lg">{t('currentShareLink')}</CardTitle>
              <CardDescription>
                {t('link')}: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  wecv.com/share/{currentShareLink.username}
                </code>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{t('viewCount')}: {currentShareLink.viewCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  {currentShareLink.passwordHash ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      {t('passwordProtected')}
                    </Badge>
                  ) : (
                    <Badge variant="outline">{t('publicAccess')}</Badge>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyShareLink}>
                  <Copy className="h-4 w-4 mr-1" />
                  {t('copyLink')}
                </Button>
                <Button variant="outline" size="sm" onClick={openShareLink}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  {t('previewLink')}
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
                  {t('delete')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* 分享链接表单 */}
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">{t('username')}</Label>
            <div className="relative">
              <Input
                id="username"
                placeholder={t('enterUsername')}
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
              {t('linkWillBeCreated')}: wecv.com/share/{username || 'username'}
            </p>
            {usernameError && (
              <p className="text-sm text-red-500">{usernameError}</p>
            )}
          </div>

          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">{t('passwordProtection')}</Label>
              <p className="text-sm text-gray-500">
                {t('passwordProtectionDescription')}
              </p>
            </div>
            <Switch
              checked={enablePassword}
              onCheckedChange={setEnablePassword}
            />
          </div>

          {enablePassword && (
            <div className="space-y-2">
              <Label htmlFor="password">{t('accessPassword')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('setAccessPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                {t('passwordRequiredForAccess')}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating || isUpdating || usernameAvailable === false}
            >
              {isCreating || isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {currentShareLink ? t('updating') : t('creating')}
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  {currentShareLink ? t('updateLink') : t('createLink')}
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
                <CardTitle className="text-lg">{t('shareStats')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">{t('totalLinks')}:</span>
                    <span className="ml-2 font-medium">{stats.totalLinks}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('activeLinks')}:</span>
                    <span className="ml-2 font-medium">{stats.activeLinks}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('totalViews')}:</span>
                    <span className="ml-2 font-medium">{stats.totalViews}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('recentViews')}:</span>
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
