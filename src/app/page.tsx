import { redirect } from 'next/navigation';
import { getUserLocale } from '@/i18n/db';

export default async function RootPage() {
  // 智能检测用户语言偏好
  const userLocale = await getUserLocale();
  
  // 重定向到检测到的语言页面
  redirect(`/${userLocale}`);
}
