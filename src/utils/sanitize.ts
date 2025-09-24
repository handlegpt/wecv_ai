import DOMPurify from 'dompurify';

/**
 * 安全地清理 HTML 内容，防止 XSS 攻击
 * @param html - 需要清理的 HTML 字符串
 * @returns 清理后的安全 HTML 字符串
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // 服务端渲染时，使用简单的正则表达式清理
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '');
  }

  // 客户端使用 DOMPurify 清理
  return DOMPurify.sanitize(html, {
    // 允许的标签
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'span', 'div',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'blockquote', 'code', 'pre'
    ],
    // 允许的属性
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'class', 'id', 'style'
    ],
    // 允许的协议
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // 移除危险的属性
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    // 移除危险的标签
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
    // 保留换行符
    KEEP_CONTENT: true,
    // 返回 DOM 节点而不是字符串
    RETURN_DOM: false,
    // 返回 DOM 片段
    RETURN_DOM_FRAGMENT: false
  });
}

/**
 * 检查内容是否包含 HTML 标签
 * @param content - 需要检查的内容
 * @returns 是否包含 HTML 标签
 */
export function containsHtml(content: string): boolean {
  return /<[^>]*>/g.test(content);
}

/**
 * 安全地渲染 HTML 内容
 * 如果内容包含 HTML 标签，则使用 sanitizeHtml 清理
 * 否则直接返回内容
 * @param content - 需要渲染的内容
 * @returns 安全的 HTML 字符串
 */
export function safeRenderHtml(content: string): string {
  if (!content) return '';
  
  if (containsHtml(content)) {
    return sanitizeHtml(content);
  }
  
  // 如果没有 HTML 标签，将换行符转换为 <br> 标签
  return content.replace(/\n/g, '<br>');
}
