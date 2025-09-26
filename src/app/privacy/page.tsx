import { redirect } from 'next/navigation';

export default function PrivacyRedirect() {
  // 重定向到默认语言版本
  redirect('/en/privacy');
}
