import { redirect } from 'next/navigation';

export default function TermsRedirect() {
  // 重定向到默认语言版本
  redirect('/en/terms');
}
