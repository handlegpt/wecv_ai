import { Metadata } from 'next'

export const performanceMetadata: Partial<Metadata> = {
  // 预加载关键资源
  other: {
    'preload': '/fonts/MiSans-VF.ttf',
    'preload': '/fonts/NotoSansSC.ttf',
    'preload': '/fonts/GeistMonoVF.woff',
  },
  
  // 资源提示
  other: {
    'dns-prefetch': 'https://fonts.googleapis.com',
    'dns-prefetch': 'https://fonts.gstatic.com',
    'preconnect': 'https://fonts.googleapis.com',
    'preconnect': 'https://fonts.gstatic.com',
  },

  // 缓存控制
  other: {
    'cache-control': 'public, max-age=31536000, immutable',
  },

  // 关键 CSS 内联
  other: {
    'critical-css': 'inline',
  },

  // 图片优化
  other: {
    'image-src': 'self data: https:',
    'img-src': 'self data: https:',
  },

  // 字体优化
  other: {
    'font-display': 'swap',
  },

  // 性能预算
  other: {
    'performance-budget': 'lcp:2500ms, fid:100ms, cls:0.1',
  },

  // 资源优先级
  other: {
    'resource-hints': 'preload, prefetch, preconnect',
  },

  // 压缩
  other: {
    'content-encoding': 'gzip, br',
  },

  // 关键渲染路径优化
  other: {
    'render-blocking': 'none',
  },

  // 移动端优化
  other: {
    'viewport-fit': 'cover',
    'mobile-web-app-capable': 'yes',
    'mobile-web-app-status-bar-style': 'default',
  },

  // 性能监控
  other: {
    'performance-observer': 'enabled',
    'web-vitals': 'enabled',
  }
}

// 生成性能优化的元数据
export function generatePerformanceMetadata(): Partial<Metadata> {
  return {
    ...performanceMetadata,
    // 添加性能相关的 OpenGraph 标签
    openGraph: {
      ...performanceMetadata.openGraph,
      other: {
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:type': 'image/png',
        'og:image:alt': 'WeCV AI - AI驱动的智能简历构建器',
      }
    },
    // 添加 Twitter 性能优化
    twitter: {
      ...performanceMetadata.twitter,
      other: {
        'twitter:image:alt': 'WeCV AI - AI驱动的智能简历构建器',
        'twitter:card': 'summary_large_image',
      }
    }
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
