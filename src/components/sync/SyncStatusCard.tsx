"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Cloud, 
  HardDrive,
  RotateCcw,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

export default function SyncStatusCard() {
  const t = useTranslations("auth");
  const { 
    syncStatus, 
    syncData, 
    refreshSyncStatus,
    isAuthenticated 
  } = useAuthStore();
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && syncStatus.isEnabled) {
      refreshSyncStatus();
    }
  }, [isAuthenticated, syncStatus.isEnabled, refreshSyncStatus]);

  const handleSync = async () => {
    if (!syncStatus.isEnabled) return;
    
    setIsRefreshing(true);
    try {
      await syncData();
      toast.success("同步完成");
    } catch (error: any) {
      toast.error(`同步失败: ${error.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      await refreshSyncStatus();
    } catch (error: any) {
      toast.error(`刷新状态失败: ${error.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isAuthenticated || !syncStatus.isEnabled) {
    return null;
  }

  const getStatusIcon = () => {
    if (syncStatus.isSyncing) {
      return <RotateCcw className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (syncStatus.pendingChanges > 0) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (syncStatus.isSyncing) {
      return "同步中...";
    }
    if (syncStatus.pendingChanges > 0) {
      return `${syncStatus.pendingChanges} 个待同步项目`;
    }
    return "已同步";
  };

  const getStatusColor = () => {
    if (syncStatus.isSyncing) {
      return "text-blue-500";
    }
    if (syncStatus.pendingChanges > 0) {
      return "text-orange-500";
    }
    return "text-green-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          同步状态
        </CardTitle>
        <CardDescription>
          管理您的简历数据同步
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 状态指示器 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          <Badge variant={syncStatus.pendingChanges > 0 ? "destructive" : "secondary"}>
            {syncStatus.pendingChanges} 项
          </Badge>
        </div>

        {/* 进度条 */}
        {syncStatus.isSyncing && (
          <div className="space-y-2">
            <Progress value={undefined} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              正在同步数据...
            </p>
          </div>
        )}

        {/* 同步信息 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">最后同步</p>
              <p className="font-medium">
                {syncStatus.lastSyncAt 
                  ? new Date(syncStatus.lastSyncAt).toLocaleString('zh-CN')
                  : "从未同步"
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">待同步</p>
              <p className="font-medium">
                {syncStatus.pendingChanges} 个项目
              </p>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button
            onClick={handleSync}
            disabled={syncStatus.isSyncing}
            className="flex-1"
            variant="default"
          >
            {syncStatus.isSyncing ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                同步中...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                立即同步
              </>
            )}
          </Button>
          <Button
            onClick={handleRefreshStatus}
            disabled={isRefreshing}
            variant="outline"
            size="icon"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* 提示信息 */}
        {syncStatus.pendingChanges > 0 && (
          <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-800 dark:text-orange-200">
                有未同步的更改
              </p>
              <p className="text-orange-700 dark:text-orange-300">
                建议定期同步以确保数据安全
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
