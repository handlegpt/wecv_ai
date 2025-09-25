import { Metadata } from 'next'

export const performanceMetadata: Partial<Metadata> = {
  // 合并所有性能优化元数据
  other: {
    // 预加载关键资源
    'preload-font-1': '/fonts/MiSans-VF.ttf',
    'preload-font-2': '/fonts/NotoSansSC.ttf',
    'preload-font-3': '/fonts/GeistMonoVF.woff',
    
    // 资源提示
    'dns-prefetch-1': 'https://fonts.googleapis.com',
    'dns-prefetch-2': 'https://fonts.gstatic.com',
    'preconnect-1': 'https://fonts.googleapis.com',
    'preconnect-2': 'https://fonts.gstatic.com',
    
    // 缓存控制
    'cache-control': 'public, max-age=31536000, immutable',
    
    // 关键 CSS 内联
    'critical-css': 'inline',
    
    // 图片优化
    'image-src': 'self data: https:',
    'img-src': 'self data: https:',
    
    // 字体优化
    'font-display': 'swap',
    
    // 性能预算
    'performance-budget': 'lcp:2500ms, fid:100ms, cls:0.1',
    
    // 资源优先级
    'resource-hints': 'preload, prefetch, preconnect',
    
    // 压缩
    'content-encoding': 'gzip, br',
    
    // 关键渲染路径优化
    'render-blocking': 'none',
    
    // 移动端优化
    'viewport-fit': 'cover',
    'mobile-web-app-capable': 'yes',
    'mobile-web-app-status-bar-style': 'default',
    
    // 性能监控
    'performance-observer': 'enabled',
    'web-vitals': 'enabled',
  }
}

// 生成性能优化的元数据
export function generatePerformanceMetadata(): Partial<Metadata> {
  return {
    ...performanceMetadata
  }
}

// 资源预加载配置
export const preloadConfig = {
  fonts: [
    '/fonts/MiSans-VF.ttf',
    '/fonts/NotoSansSC.ttf', 
    '/fonts/GeistMonoVF.woff'
  ],
  images: [
    '/logo.svg',
    '/avatar.png'
  ],
  scripts: [
    // 关键脚本预加载
  ],
  styles: [
    // 关键样式预加载
  ]
}

// 性能预算配置
export const performanceBudget = {
  lcp: 2500, // 最大内容绘制
  fid: 100,  // 首次输入延迟
  cls: 0.1,  // 累积布局偏移
  fcp: 1800, // 首次内容绘制
  ttfb: 600, // 首字节时间
  si: 3400   // 速度指数
}
