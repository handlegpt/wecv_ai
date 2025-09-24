"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SyncConflict, ResumeSyncData } from "@/services/syncService";
import { Calendar, Clock, User, Cloud, HardDrive } from "lucide-react";

interface SyncConflictDialogProps {
  conflicts: SyncConflict[];
  isOpen: boolean;
  onClose: () => void;
  onResolve: (resolutions: { [resumeId: string]: 'local' | 'cloud' | 'merge' }) => void;
}

export default function SyncConflictDialog({ 
  conflicts, 
  isOpen, 
  onClose, 
  onResolve 
}: SyncConflictDialogProps) {
  const t = useTranslations("sync");
  const [resolutions, setResolutions] = useState<{ [resumeId: string]: 'local' | 'cloud' | 'merge' }>({});

  const handleResolve = () => {
    onResolve(resolutions);
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVersionInfo = (version: ResumeSyncData) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="outline">版本 {version.version}</Badge>
        <span className="text-sm text-muted-foreground">
          {formatDate(version.lastModified)}
        </span>
      </div>
      <div className="text-sm text-muted-foreground">
        模板: {version.templateId}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>同步冲突解决</DialogTitle>
          <DialogDescription>
            检测到 {conflicts.length} 个简历存在版本冲突，请选择如何处理每个冲突。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {conflicts.map((conflict, index) => (
            <Card key={conflict.resumeId}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {conflict.title}
                </CardTitle>
                <CardDescription>
                  简历 ID: {conflict.resumeId}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 本地版本 */}
                  <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        本地版本
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getVersionInfo(conflict.localVersion)}
                    </CardContent>
                  </Card>

                  {/* 云端版本 */}
                  <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Cloud className="h-4 w-4" />
                        云端版本
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getVersionInfo(conflict.cloudVersion)}
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-sm font-medium">选择解决方案:</Label>
                  <RadioGroup
                    value={resolutions[conflict.resumeId] || 'local'}
                    onValueChange={(value) => setResolutions(prev => ({
                      ...prev,
                      [conflict.resumeId]: value as 'local' | 'cloud' | 'merge'
                    }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="local" id={`local-${conflict.resumeId}`} />
                      <Label htmlFor={`local-${conflict.resumeId}`} className="flex-1">
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4" />
                          <span>使用本地版本</span>
                          <Badge variant="outline" className="text-xs">推荐</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          保留本地修改，覆盖云端版本
                        </p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cloud" id={`cloud-${conflict.resumeId}`} />
                      <Label htmlFor={`cloud-${conflict.resumeId}`} className="flex-1">
                        <div className="flex items-center gap-2">
                          <Cloud className="h-4 w-4" />
                          <span>使用云端版本</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          使用云端版本，覆盖本地修改
                        </p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="merge" id={`merge-${conflict.resumeId}`} />
                      <Label htmlFor={`merge-${conflict.resumeId}`} className="flex-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>手动合并</span>
                          <Badge variant="secondary" className="text-xs">高级</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          稍后手动处理冲突
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleResolve}>
            解决冲突 ({conflicts.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
