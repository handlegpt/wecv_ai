import { Metadata } from 'next'

export const defaultMetadata: Metadata = {
  title: {
    default: 'WeCV AI - AI驱动的智能简历构建器',
    template: '%s | WeCV AI'
  },
  description: 'WeCV AI 是一个免费开源的智能简历构建器，支持AI润色、多语言、数据本地存储，无需注册，让您的简历更加专业。',
  keywords: [
    'AI简历',
    '智能简历',
    '简历制作',
    '简历模板',
    '简历编辑器',
    '免费简历',
    'AI润色',
    '求职工具',
    '简历设计',
    '在线简历',
    '简历优化',
    'AI写作',
    'WeCV AI',
    'AI履歴書',
    'スマート履歴書',
    '履歴書作成',
    '履歴書テンプレート',
    '履歴書エディター',
    '無料履歴書',
    'AI潤色',
    '就職ツール',
    '履歴書デザイン',
    'オンライン履歴書',
    '履歴書最適化',
    'AIライティング',
    'resume builder',
    'AI resume',
    'smart resume'
  ],
  authors: [{ name: 'WeCV AI Team' }],
  creator: 'WeCV AI',
  publisher: 'WeCV AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://wecv.com'),
  alternates: {
    canonical: 'https://wecv.com',
    languages: {
      'zh': 'https://wecv.com/zh',
      'en': 'https://wecv.com/en',
      'ja': 'https://wecv.com/ja',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://wecv.com',
    siteName: 'WeCV AI',
    title: 'WeCV AI - AI驱动的智能简历构建器',
    description: 'WeCV AI 是一个免费开源的智能简历构建器，支持AI润色、多语言、数据本地存储，无需注册，让您的简历更加专业。',
    images: [
      {
        url: 'https://wecv.com/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'WeCV AI - AI驱动的智能简历构建器',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WeCV AI - AI驱动的智能简历构建器',
    description: 'WeCV AI 是一个免费开源的智能简历构建器，支持AI润色、多语言、数据本地存储，无需注册，让您的简历更加专业。',
    images: ['https://wecv.com/twitter-image'],
    creator: '@wecvai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

export function generatePageMetadata({
  title,
  description,
  keywords = [],
  image,
  url,
}: {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
}): Metadata {
  return {
    title,
    description,
    keywords: [...(Array.isArray(defaultMetadata.keywords) ? defaultMetadata.keywords : []), ...keywords],
    openGraph: {
      ...defaultMetadata.openGraph,
      title,
      description,
      url: url ? `https://wecv.com${url}` : defaultMetadata.openGraph?.url,
      images: image ? [{ url: `https://wecv.com${image}`, alt: title }] : defaultMetadata.openGraph?.images,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title,
      description,
      images: image ? [`https://wecv.com${image}`] : defaultMetadata.twitter?.images,
    },
  }
}
