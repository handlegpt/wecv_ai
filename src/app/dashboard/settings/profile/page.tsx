"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/useAuthStore";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Calendar, 
  Save, 
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const t = useTranslations();
  const { user, updateUser } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    avatar: ""
  });

  // 初始化表单数据
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        avatar: user.avatar || ""
      });
    }
  }, [user]);

  // 检查Supabase配置
  useEffect(() => {
    setSupabaseConfigured(isSupabaseConfigured());
  }, []);

  // 处理表单输入
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 处理头像上传
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!supabaseConfigured) {
      toast.error("文件上传服务未配置");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      
      // 生成唯一文件名
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      
      // 上传到Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (error) throw error;

      // 获取公开URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      handleInputChange('avatar', publicUrl);
      toast.success("头像上传成功");
    } catch (error: any) {
      toast.error(error.message || "头像上传失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 保存用户资料
  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      if (supabaseConfigured) {
        const supabase = getSupabaseClient();
        
        // 更新Supabase profiles表
        const { error } = await supabase
          .from('profiles')
          .update({
            name: formData.name,
            bio: formData.bio,
            avatar_url: formData.avatar,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;
      }

      // 更新本地状态
      await updateUser({
        name: formData.name,
        bio: formData.bio,
        avatar: formData.avatar,
        updatedAt: new Date().toISOString()
      });

      toast.success("个人资料更新成功");
    } catch (error: any) {
      toast.error(error.message || "更新失败");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">请先登录以管理个人资料</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">个人资料</h1>
        <p className="text-muted-foreground">管理您的个人信息和偏好设置</p>
      </div>

      {/* 头像设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            头像设置
          </CardTitle>
          <CardDescription>
            上传您的头像，让个人资料更加完整
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.avatar} alt={formData.name} />
              <AvatarFallback className="text-lg">
                {formData.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        上传中...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        更换头像
                      </>
                    )}
                  </span>
                </Button>
              </Label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                支持 JPG、PNG 格式，建议尺寸 200x200px
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            基本信息
          </CardTitle>
          <CardDescription>
            编辑您的基本个人信息
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="请输入您的姓名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={formData.email}
                  disabled
                  className="pl-10 bg-muted"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                邮箱地址不可修改
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">个人简介</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="介绍一下自己..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* 账户信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            账户信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">注册时间</p>
              <p>{new Date(user.createdAt).toLocaleDateString('zh-CN')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">最后更新</p>
              <p>{new Date(user.updatedAt).toLocaleDateString('zh-CN')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="min-w-[120px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              保存更改
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
